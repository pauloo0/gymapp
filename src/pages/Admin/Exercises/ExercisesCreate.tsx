import type React from 'react'
import { useState, useEffect, useRef } from 'react'

import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import Loading from '@/components/reusable/Loading'
import { UploadIcon, Save, X, Plus, AlertCircle, Check } from 'lucide-react'

import { Bodypart, Equipment } from '@/utils/interfaces'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/utils/hooks'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Alert, AlertDescription } from '@/components/ui/alert'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  name: z.string().min(1, 'Preencha o nome do exercício.'),
  equipment_id: z.string().min(1, 'Selecione o equipamento'),
  bodypart_id: z.string().min(1, 'Selecione o músculo treinado'),
  difficulty_level: z.string(),
  exercise_measurements: z
    .array(
      z.object({
        measurement_type: z.string(),
        is_required: z.boolean(),
      })
    )
    .min(2, 'Selecione 2 unidades de medida')
    .max(2),
  description: z.string(),
  media: z.array(
    z.object({
      type: z.string(),
      url: z.string(),
    })
  ),
})

type FormValues = z.infer<typeof formSchema>

const measurementTypes = [
  { value: 'weight', label: 'Peso' },
  { value: 'reps', label: 'Repetições' },
  { value: 'distance', label: 'Distância' },
  { value: 'time', label: 'Tempo' },
]

export default function ExercisesCreate() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const isMobile = useIsMobile()

  const [isLoading, setIsLoading] = useState(true)
  const [equipment, setEquipment] = useState<Equipment[] | undefined>(undefined)
  const [bodyparts, setBodyparts] = useState<Bodypart[] | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      equipment_id: '',
      bodypart_id: '',
      difficulty_level: 'beginner',
      exercise_measurements: [],
      description: '',
      media: [],
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [resEquipment, resBodyparts] = await Promise.all([
          axios.get(`${apiUrl}/equipment`),
          axios.get(`${apiUrl}/bodyparts`),
        ])

        if (!resEquipment || !resBodyparts) {
          setErrorMessage('Não encontrei equipamentos ou')
          return
        }

        setEquipment(resEquipment.data.equipment)
        setBodyparts(resBodyparts.data.bodyparts)
      } catch (error) {
        console.error('An unexpected error ocurred:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const [openSelect, setOpenSelect] = useState(false)
  const [selectionError, setSelectionError] = useState<string | null>(null)

  // Ref to store raw File objects
  const filesRef = useRef<File[]>([])

  // Handle file selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: FormValues['media']) => void
  ) => {
    if (!e.target.files || e.target.files.length === 0) return

    const currentMedia = form.getValues().media || []
    const newFiles = Array.from(e.target.files)

    // Store raw files in filesRef
    filesRef.current = [...filesRef.current, ...newFiles]

    // Generate preview URLs for UI
    const newMedia = newFiles.map((file) => {
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : 'unknown'
      const url = URL.createObjectURL(file) // Used for previews only
      return { type: fileType, url }
    })

    // Update form state with previews
    onChange([...currentMedia, ...newMedia])
  }

  // Remove a file
  const removeFile = (index: number) => {
    const currentMedia = form.getValues().media

    // Revoke preview URL
    URL.revokeObjectURL(currentMedia[index].url)

    // Remove from filesRef
    filesRef.current = filesRef.current.filter((_, i) => i !== index)

    // Update form state
    form.setValue(
      'media',
      currentMedia.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }

  const cancelCreate = () => {
    navigate(-1)
  }

  // Function to toggle a measurement type (add if not present, remove if present)
  const toggleMeasurementType = (
    type: string,
    onChange: (value: FormValues['exercise_measurements']) => void
  ) => {
    const currentMeasurements = form.getValues().exercise_measurements || []

    // Check if the measurement type already exists
    const existingIndex = currentMeasurements.findIndex(
      (m) => m.measurement_type === type
    )

    if (existingIndex >= 0) {
      // If it exists, remove it
      onChange(currentMeasurements.filter((_, i) => i !== existingIndex))
      setSelectionError(null)
    } else {
      // If it doesn't exist, add it if we have less than 2 items
      if (currentMeasurements.length < 2) {
        onChange([
          ...currentMeasurements,
          { measurement_type: type, is_required: true },
        ])
        setSelectionError(null)
      } else {
        // Show error if trying to add more than 2 items
        setSelectionError(
          'Só pode selecionar 2 unidades de medida. Remova 1 antes de continuar.'
        )
      }
    }
  }

  // Function to remove a measurement type
  const removeMeasurementType = (index: number) => {
    const currentMeasurements = form.getValues().exercise_measurements

    form.setValue(
      'exercise_measurements',
      currentMeasurements.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
    setSelectionError(null)
  }

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('equipment_id', data.equipment_id)
    formData.append('bodypart_id', data.bodypart_id)
    formData.append('difficulty_level', data.difficulty_level)
    formData.append(
      'exercise_measurements',
      JSON.stringify(data.exercise_measurements)
    )
    formData.append('description', data.description)
    formData.append('name', data.name)

    filesRef.current.forEach((file) => {
      formData.append('media', file)
    })

    try {
      setIsLoading(true)

      const res = await axios.post(`${apiUrl}/exercises`, formData, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (res.status !== 201) {
        console.error(res.data)
        throw new Error(res.data)
      }

      setErrorMessage(undefined)
      setSuccessMessage('Exercício criado com sucesso!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        setErrorMessage(`Erro inesperado: ${error}`)
        console.error('An unexpected error ocurred:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (errorMessage) setIsDialogOpen(true)
  }, [errorMessage])

  useEffect(() => {
    if (successMessage) setIsDialogOpen(true)
  }, [successMessage])

  const handleSuccessClose = () => {
    setIsDialogOpen(false)
    navigate('/admin/exercicios')
  }

  const handleErrorClose = () => {
    setIsDialogOpen(false)
    setErrorMessage(undefined)
  }

  if (isLoading) return <Loading />

  return (
    <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
      <h1 className='mb-6 text-xl'>Criar exercício</h1>

      {successMessage && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && handleSuccessClose()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sucesso</DialogTitle>
            </DialogHeader>
            {successMessage}
            <DialogFooter>
              <Button
                type='button'
                variant={'default'}
                onClick={handleSuccessClose}
              >
                Ok
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {errorMessage && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && handleErrorClose}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Erro</DialogTitle>
            </DialogHeader>
            {errorMessage}
            <DialogFooter>
              <Button
                type='button'
                variant={'default'}
                onClick={handleErrorClose}
              >
                Ok
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col items-start justify-start gap-4'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className={errorMessage ? 'text-red-500' : ''}>
                  Nome do exercício
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='equipment_id'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className={errorMessage ? 'text-red-500' : ''}>
                  Equipamento
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipment ? (
                      equipment.map((equip) => (
                        <SelectItem key={equip.id} value={equip.id}>
                          {equip.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value='' disabled>
                        Sem equipemento disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bodypart_id'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className={errorMessage ? 'text-red-500' : ''}>
                  Músculo
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bodyparts ? (
                      bodyparts.map((bodypart) => (
                        <SelectItem key={bodypart.id} value={bodypart.id}>
                          {bodypart.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value='' disabled>
                        Sem equipemento disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='difficulty_level'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className={errorMessage ? 'text-red-500' : ''}>
                  Nível dificuldade
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='beginner'>Iniciante</SelectItem>
                    <SelectItem value='intermediate'>Intermédio</SelectItem>
                    <SelectItem value='advanced'>Avançado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='exercise_measurements'
            render={({ field }) => (
              <FormItem className='flex flex-col w-full'>
                <FormLabel className={errorMessage ? 'text-red-500' : ''}>
                  Unidades de medida (Selecionar 2)
                </FormLabel>
                <Popover open={openSelect} onOpenChange={setOpenSelect}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={openSelect}
                        className={cn(
                          'w-full justify-between hover:bg-gray-900'
                        )}
                      >
                        Selecionar unidades de medida
                        <Badge
                          variant={
                            field.value.length === 2 ? 'default' : 'outline'
                          }
                          className={cn(
                            'ml-2',
                            field.value.length === 2
                              ? 'bg-lime-500 text-gray-950 hover:bg-lime-600'
                              : 'border-gray-600 text-gray-200'
                          )}
                        >
                          {field.value.length}/2
                        </Badge>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[calc(100vw_-_2rem)] max-w-[500px] p-0 border-gray-700'>
                    <Command>
                      <CommandInput placeholder='Unidade de medida...' />
                      <CommandList>
                        {selectionError && (
                          <div className='px-2 py-1.5'>
                            <Alert
                              variant='destructive'
                              className='py-2 text-gray-100 border-red-800 bg-red-900/50'
                            >
                              <AlertCircle className='w-4 h-4 text-red-400' />
                              <AlertDescription className='text-xs text-gray-100'>
                                {selectionError}
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                        <CommandGroup>
                          {measurementTypes.map((type) => {
                            const isSelected = field.value.some(
                              (item) => item.measurement_type === type.value
                            )
                            const isDisabled =
                              field.value.length >= 2 && !isSelected

                            return (
                              <CommandItem
                                key={type.value}
                                value={type.value}
                                disabled={isDisabled}
                                onSelect={() =>
                                  toggleMeasurementType(
                                    type.value,
                                    field.onChange
                                  )
                                }
                                className={cn(
                                  'text-gray-100 aria-selected:bg-gray-700',
                                  isDisabled && 'opacity-50 cursor-not-allowed',
                                  isSelected && 'bg-gray-700'
                                )}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected
                                      ? 'text-lime-500 opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {type.label}
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                        <CommandEmpty className='text-gray-400'>
                          Não encontrei esta medida
                        </CommandEmpty>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {field.value.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-3'>
                    {field.value.map((item, index) => {
                      const measurementType = measurementTypes.find(
                        (type) => type.value === item.measurement_type
                      )

                      return (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='px-3 py-1 text-gray-100 bg-gray-800 border-gray-700 hover:bg-gray-700'
                        >
                          {measurementType?.label || item.measurement_type}
                          <button
                            type='button'
                            className='ml-2 text-gray-400 hover:text-lime-400'
                            onClick={() => removeMeasurementType(index)}
                          >
                            <X className='w-3 h-3' />
                            <span className='sr-only'>Remove</span>
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='flex flex-row items-center justify-start gap-1'>
                  Descrição
                </FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File upload field */}
          <FormField
            control={form.control}
            name='media'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='flex flex-row items-center justify-start gap-1'>
                  Carregar ficheiros
                  <Button
                    type='button'
                    size={'sm'}
                    variant={'outline'}
                    onClick={() => {
                      const input = document.getElementById(
                        'file-upload'
                      ) as HTMLInputElement
                      input.click()
                    }}
                  >
                    <Plus className='w-5 h-5' />
                  </Button>
                </FormLabel>
                <FormControl>
                  <div className='flex flex-col items-center gap-4 sm:flex-row'>
                    <div className='relative flex-1 w-full'>
                      <Input
                        id='file-upload'
                        type='file'
                        multiple
                        accept='image/*,video/*'
                        onChange={(e) => handleFileChange(e, field.onChange)}
                        className='absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer'
                      />
                      <div className='flex flex-col items-center justify-center w-full p-6 text-center text-gray-600 border border-gray-600 border-dashed rounded-md'>
                        <UploadIcon className='w-6 h-6 mb-2' />
                        <p className='text-sm'>
                          {typeof window !== 'undefined' &&
                          window.matchMedia('(pointer: coarse)').matches
                            ? 'Toque para selecionar ficheiros'
                            : 'Arraste ficheiros aqui ou clique para procurar'}
                        </p>
                        <p className='mt-1 text-xs'>Suporta imagens e videos</p>
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Preview section */}
          <div className='w-full mx-auto'>
            {form.watch('media').length > 0 && (
              <div className=''>
                <h2 className='flex flex-col items-start justify-start gap-1 mb-4 font-semibold'>
                  Previsão de ficheiros
                  <span className='text-xs font-normal text-gray-500'>
                    {form.watch('media').length} selecionado
                    {form.watch('media').length > 1 ? 's' : ''}
                  </span>
                </h2>
                <div className='grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4'>
                  {form.watch('media').map((file, index) => (
                    <div
                      key={index}
                      className={`relative ${!isMobile ? 'group' : ''}`}
                    >
                      <div className='overflow-hidden border rounded-md aspect-square bg-gray-50'>
                        {file.type === 'image' ? (
                          <img
                            src={file.url || '/placeholder.svg'}
                            alt={`Preview ${index}`}
                            className='object-cover w-full h-full'
                          />
                        ) : file.type === 'video' ? (
                          <video
                            src={file.url}
                            controls
                            className='object-cover w-full h-full'
                            controlsList='nodownload'
                            playsInline
                          />
                        ) : (
                          <div className='flex items-center justify-center w-full h-full text-gray-400'>
                            Ficheiro não suportado
                          </div>
                        )}
                      </div>
                      <div className='absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded'>
                        {file.type === 'image'
                          ? 'Image'
                          : file.type === 'video'
                          ? 'Video'
                          : 'File'}
                      </div>
                      <button
                        type='button'
                        onClick={() => removeFile(index)}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md md:opacity-0 md:group-hover:opacity-100 md:transition-opacity'
                        aria-label='Remove file'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='grid w-full grid-cols-2 gap-2'>
            <Button
              type='submit'
              size={'sm'}
              className={cn(
                'flex items-center justify-center px-3',
                isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              <Save className='w-4 h-4 mr-1' />
              Guardar
            </Button>
            <Button
              type='reset'
              onClick={cancelCreate}
              size={'sm'}
              className='flex items-center justify-center px-3'
              variant='secondary'
              disabled={isLoading}
            >
              <X className='w-4 h-4 mr-1' /> Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </main>
  )
}
