import { useState, useEffect } from 'react'
import axios from 'axios'

import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray, Controller } from 'react-hook-form'

import { Bodypart, Client, Equipment, Exercise } from '@/utils/interfaces'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'
import WorkoutAddExercises from '@/pages/Workouts/WorkoutAddExercises'

import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  Ellipsis,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'

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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate } from 'react-router'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  client_id: z.string().nonempty('O cliente é obrigatório.'),
  name: z
    .string()
    .trim()
    .nonempty('O nome é obrigatório.')
    .min(5, { message: 'O nome deve ter no mínimo 5 caracteres.' })
    .max(30, { message: 'O nome deve ter no máximo 30 caracteres.' }),
  active: z.boolean().default(true),
  public: z.boolean().default(false),
  is_power_test: z.boolean().default(false),
  notes: z
    .string()
    .trim()
    .max(255, { message: 'Não pode exceder os 255 caracteres.' }),
  exercises: z
    .array(
      z.object({
        exercise_id: z.string(),
        sets: z.array(
          z.object({
            reps: z.number(),
            weight: z.number().optional().default(0),
          })
        ),
      })
    )
    .min(1, { message: 'O plano deve ter pelo menos um exercício.' }),
})

function WorkoutCreate() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [dbExercises, setDbExercises] = useState<Exercise[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [bodyparts, setBodyparts] = useState<Bodypart[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  const [exercisesDrawerOpen, setExercisesDrawerOpen] = useState<boolean>(false)

  // Fetch data from DB
  useEffect(() => {
    const fetchDbExercises = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/exercises`)

        setDbExercises(res.data.exercises)

        setIsLoading(false)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    const fetchClients = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/clients`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const clients: Client[] = res.data.clients
        setClients(clients)
        setIsLoading(false)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    const fetchBodyparts = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/bodyparts`)
        const bodyparts: Bodypart[] = res.data.bodyparts
        setBodyparts(bodyparts)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    const fetchEquipment = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/equipment`)
        const equipment: Equipment[] = res.data.equipment
        setEquipment(equipment)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    fetchDbExercises()
    fetchClients()
    fetchBodyparts()
    fetchEquipment()
  }, [token])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: '',
      name: '',
      active: true,
      public: false,
      is_power_test: false,
      notes: '',
      exercises: [],
    },
  })

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  const cancelCreate = () => {
    navigate('/treinos')
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const workoutInfo = {
      ...values,
      exercises: values.exercises.map((exercise, index) => ({
        exercise_id: exercise.exercise_id,
        order: index + 1,
        sets: exercise.sets.map((set, setIndex) => {
          return {
            set_number: setIndex + 1,
            ...set,
          }
        }),
      })),
    }

    try {
      const resNewWorkout = await axios.post(
        `${apiUrl}/workouts`,
        workoutInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      setIsLoading(false)

      if (resNewWorkout.status === 201) {
        navigate('/treinos')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.status)
        console.error(error.response?.data)
      } else {
        console.error('An unexpected error ocurred:', error)
      }
    }
  }

  const removeExercise = (index: number) => {
    remove(index) // Removes from form fields
  }

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1

    swap(index, newIndex) // Updates form field's order
  }

  const handleAddExercises = () => {
    setExercisesDrawerOpen(!exercisesDrawerOpen)
  }

  const addedExerciseIds = form
    .watch('exercises')
    .map((exercise) => exercise.exercise_id)

  useEffect(() => {
    setAvailableExercises(() => {
      return addedExerciseIds.length === 0
        ? dbExercises
        : dbExercises.filter(
            (exercise) => !addedExerciseIds.includes(exercise.id)
          )
    })
  }, [addedExerciseIds, dbExercises])

  const addSet = (exerciseId: string) => {
    const exercises = form.getValues('exercises')
    const updatedExercises = exercises.map((exercise) => {
      if (exercise.exercise_id === exerciseId) {
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              reps: 0,
              weight: 0,
            },
          ],
        }
      }
      return exercise
    })

    form.setValue('exercises', updatedExercises)
  }

  const deleteSet = (exerciseId: string, setIndex: number) => {
    const exercises = form.getValues('exercises')
    const updatedExercises = exercises.map((exercise) => {
      if (exercise.exercise_id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.filter((_, idx) => idx !== setIndex),
        }
      }
      return exercise
    })

    form.setValue('exercises', updatedExercises)
  }

  if (isLoading) return <Loading />

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <h1 className='mb-6 text-xl'>Criar plano de treino</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-2 gap-4'
          >
            <section
              id='text_fields'
              className='flex flex-col col-span-2 gap-2'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={`${errorMessage ? 'text-red-500' : ''}`}
                    >
                      Nome do plano
                    </FormLabel>
                    <FormControl>
                      <Input
                        className={`w-full ${
                          errorMessage ? 'border-red-500' : ''
                        }`}
                        type='text'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='client_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={`${errorMessage ? 'text-red-500' : ''}`}
                    >
                      Cliente
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full ${
                            errorMessage ? 'border-red-500' : ''
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='z-50'>
                        {clients &&
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.firstname + ' ' + client.lastname}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={`${errorMessage ? 'text-red-500' : ''}`}
                    >
                      Notas
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section id='checkboxes' className='flex flex-row col-span-2'>
              <FormField
                control={form.control}
                name='active'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start p-2 space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={form.getValues('active')}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Ativo</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='public'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start p-2 space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={form.getValues('public')}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Público</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='is_power_test'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start p-2 space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={form.getValues('is_power_test')}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Teste Máximo</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </section>

            <div className='col-span-2'>
              <Drawer
                open={exercisesDrawerOpen}
                onOpenChange={() => handleAddExercises()}
              >
                <DrawerTrigger asChild className='w-full'>
                  <Button size={'sm'}>
                    <Plus className='w-5 h-5 mr-1' /> Adicionar Exercício
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Adicionar Exercícios</DrawerTitle>
                    <DrawerDescription></DrawerDescription>
                  </DrawerHeader>
                  <WorkoutAddExercises
                    availableExercises={availableExercises}
                    appendExercises={append}
                    handleOpenClose={handleAddExercises}
                    bodyparts={bodyparts}
                    equipment={equipment}
                  />
                </DrawerContent>
              </Drawer>
            </div>

            {/* WORKOUT EXERCISES LIST */}
            {fields.length > 0 && (
              <div className='flex flex-col grid-cols-2 col-span-2 gap-4'>
                {fields.map((field, index) => {
                  const exercise = form.getValues(`exercises.${index}`)
                  const isFirst = index === 0
                  const isLast = index === fields.length - 1

                  return (
                    <div
                      key={field.id}
                      className='flex flex-col px-3 py-2 border border-gray-800 rounded-md'
                    >
                      <div className='flex flex-row items-center justify-between'>
                        <span className='font-bold'>
                          {
                            dbExercises.find(
                              (ex) => ex.id === exercise.exercise_id
                            )?.name
                          }
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Ellipsis className='w-4 h-4' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {!isFirst && (
                              <DropdownMenuItem
                                className='flex flex-row items-center justify-start'
                                onClick={() => moveExercise(index, 'up')}
                              >
                                <ChevronUp className='w-4 h-4 mr-1' />
                                Mover para cima
                              </DropdownMenuItem>
                            )}
                            {!isLast && (
                              <DropdownMenuItem
                                className='flex flex-row items-center justify-start'
                                onClick={() => moveExercise(index, 'down')}
                              >
                                <ChevronDown className='w-4 h-4 mr-1' />
                                Mover para baixo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className='flex flex-row items-center justify-start'
                              onClick={() => removeExercise(index)}
                            >
                              <X className='w-4 h-4 mr-1' />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Sets table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Série</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Kg</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.sets.map((_, setIndex) => (
                            <TableRow key={setIndex}>
                              <TableCell>{setIndex + 1}</TableCell>
                              <TableCell>
                                <Controller
                                  name={`exercises.${index}.sets.${setIndex}.reps`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <Input
                                      type='number'
                                      min={0}
                                      value={field.value}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <Controller
                                  name={`exercises.${index}.sets.${setIndex}.weight`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <Input
                                      type='number'
                                      min={0}
                                      value={field.value}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell className='text-end'>
                                <Button
                                  type='button'
                                  size={'sm'}
                                  variant={'ghost'}
                                  onClick={() =>
                                    deleteSet(exercise.exercise_id, setIndex)
                                  }
                                >
                                  <Trash2 className='w-5 h-5 text-red-500' />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className='p-0'>
                              <Button
                                type='button'
                                size={'sm'}
                                variant={'outline'}
                                className='w-full mt-2'
                                onClick={() => addSet(exercise.exercise_id)}
                              >
                                <Plus className='w-5 h-5 mr-1' />
                                Adicionar série
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )
                })}
              </div>
            )}

            <div className='grid grid-cols-2 col-span-2 gap-2'>
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
    </>
  )
}

export default WorkoutCreate
