import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray, Controller } from 'react-hook-form'

import {
  Workout,
  Bodypart,
  Client,
  Equipment,
  Exercise,
  WorkoutExercise,
  MeasurementType,
} from '@/utils/interfaces'

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

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty('O nome é obrigatório.')
    .min(5, { message: 'O nome deve ter no mínimo 5 caracteres.' })
    .max(30, { message: 'O nome deve ter no máximo 30 caracteres.' }),
  active: z.boolean().default(true),
  public: z.boolean().default(false),
  type: z.enum(['regular', 'power_test', 'one_rm_test']),
  notes: z
    .string()
    .trim()
    .max(255, { message: 'Não pode exceder os 255 caracteres.' }),
  exercises: z
    .array(
      z.object({
        exercise_id: z.string(),
        exercise_measurements: z.array(
          z.object({
            id: z.string().optional(),
            measurement_type: z.enum(['reps', 'weight', 'time', 'distance']),
            is_required: z.boolean().default(false),
          })
        ),
        sets: z.array(
          z.object({
            reps: z.number().optional().default(0),
            weight: z.number().optional().default(0),
            time: z.number().optional().default(0),
            distance: z.number().optional().default(0),
          })
        ),
      })
    )
    .min(1, { message: 'O plano deve ter pelo menos um exercício.' }),
})

function WorkoutEdit() {
  const navigate = useNavigate()

  const { workout_id } = useParams()
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  )
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [dbExercises, setDbExercises] = useState<Exercise[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [bodyparts, setBodyparts] = useState<Bodypart[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [exercisesDrawerOpen, setExercisesDrawerOpen] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      active: true,
      public: false,
      type: 'regular',
      notes: '',
      exercises: [],
    },
  })

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  // Fetch data from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const resWorkout = await axios.get(`${apiUrl}/workouts/${workout_id}`, {
          headers: {
            'Auth-Token': token,
          },
        })
        const workout: Workout = resWorkout.data.workout

        if (workout.clients) {
          const resClient = await axios.get(
            `${apiUrl}/clients/${workout.clients.id}`,
            {
              headers: {
                'Auth-Token': token,
              },
            }
          )
          const client: Client = resClient.data.client
          setCurrentClient(client)
        }

        const [resExercises, resBodyparts, resEquipment] = await Promise.all([
          axios.get(`${apiUrl}/exercises`),
          axios.get(`${apiUrl}/bodyparts`),
          axios.get(`${apiUrl}/equipment`),
        ])
        const exercises: Exercise[] = resExercises.data.exercises
        setDbExercises(exercises)
        const bodyparts: Bodypart[] = resBodyparts.data.bodyparts
        setBodyparts(bodyparts)
        const equipment: Equipment[] = resEquipment.data.equipment
        setEquipment(equipment)

        // Pre-load form with workout data
        const initialExercises = workout.workout_exercises.map(
          (ex: WorkoutExercise) => ({
            exercise_id: ex.exercises.id,
            exercise_measurements: ex.exercises.exercise_measurements,
            sets: ex.sets
              .sort((a, b) => a.set_number - b.set_number)
              .map((set) => ({
                reps: set.reps || 0,
                weight: set.weight || 0,
                time: set.time || 0,
                distance: set.distance || 0,
              })),
          })
        )

        form.reset({
          name: workout.name,
          active: workout.active,
          public: workout.public,
          type: workout.type,
          notes: workout.notes || '',
          exercises: initialExercises,
        })
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, workout_id, form])

  const cancelEdit = () => {
    if (!currentClient) {
      navigate(
        workoutType === 'power_test'
          ? `/avaliacoes/potencia`
          : `/avaliacoes/forca`
      )
    } else {
      navigate(`/treino/${workout_id}`)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMessage(undefined)
    setIsLoading(true)

    const updatedWorkoutInfo = {
      ...values,
      client_id: currentClient?.id,
      exercises: values.exercises.map((exercise, index) => ({
        exercise_id: exercise.exercise_id,
        order: index + 1,
        sets: exercise.sets.map((set, setIndex) => ({
          set_number: setIndex + 1,
          ...set,
        })),
      })),
    }

    try {
      const resUpdatedWorkout = await axios.put(
        `${apiUrl}/workouts/${workout_id}`,
        updatedWorkoutInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      setIsLoading(false)

      if (resUpdatedWorkout.status !== 200) {
        console.error(resUpdatedWorkout.data)
        throw new Error(resUpdatedWorkout.data)
      }

      setErrorMessage(undefined)
      setSuccessMessage('Plano de treino atualizado com sucesso!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        setErrorMessage(`Erro inesperado: ${error}`)
        console.error('An unexpected error occurred:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const removeExercise = (index: number) => {
    remove(index)
  }

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    swap(index, newIndex)
  }

  const handleAddExercises = () => {
    setExercisesDrawerOpen(!exercisesDrawerOpen)
  }

  const addedExerciseIds = useMemo(
    () => form.watch('exercises').map((exercise) => exercise.exercise_id),
    [form]
  )

  const workoutType = form.watch('type')

  useEffect(() => {
    const filteredExercises =
      addedExerciseIds.length === 0
        ? dbExercises
        : dbExercises.filter(
            (exercise) => !addedExerciseIds.includes(exercise.id)
          )

    setAvailableExercises(filteredExercises)
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
              time: 0,
              distance: 0,
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

  useEffect(() => {
    if (errorMessage) setIsDialogOpen(true)
  }, [errorMessage])

  useEffect(() => {
    if (successMessage) setIsDialogOpen(true)
  }, [successMessage])

  const handleSuccessClose = () => {
    setIsDialogOpen(false)

    if (!currentClient) {
      navigate(
        workoutType === 'power_test'
          ? `/avaliacoes/potencia`
          : `/avaliacoes/forca`
      )
    } else {
      navigate(`/treino/${workout_id}`)
    }
  }

  const handleErrorClose = () => {
    setIsDialogOpen(false)
    setErrorMessage(undefined)
  }

  if (isLoading) return <Loading />

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <h1 className='mb-6 text-xl'>
          Editar plano de treino
          {currentClient &&
            ' de ' + currentClient.firstname + ' ' + currentClient.lastname}
        </h1>

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
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Ativo</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {workoutType === 'regular' && (
                <FormField
                  control={form.control}
                  name='public'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start p-2 space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Público</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </section>

            <div className='col-span-2'>
              <Drawer
                open={exercisesDrawerOpen}
                onOpenChange={handleAddExercises}
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

            {fields.length > 0 && (
              <div className='flex flex-col grid-cols-2 col-span-2 gap-4'>
                {fields.map((field, index) => {
                  const exercise = form.getValues(`exercises.${index}`)
                  const isFirst = index === 0
                  const isLast = index === fields.length - 1

                  const measurementUnits = exercise.exercise_measurements.map(
                    (measurement) => {
                      switch (measurement.measurement_type) {
                        case 'reps':
                          return { heading: 'Reps', fieldName: 'reps' }
                        case 'weight':
                          return { heading: 'Kg', fieldName: 'weight' }
                        case 'time':
                          return { heading: 'Mins', fieldName: 'time' }
                        case 'distance':
                          return { heading: 'Kms', fieldName: 'distance' }
                        default:
                          return { heading: '', fieldName: '' }
                      }
                    }
                  )

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

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Série</TableHead>
                            <TableHead>{measurementUnits[0].heading}</TableHead>
                            <TableHead>{measurementUnits[1].heading}</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.sets.map((_, setIndex) => (
                            <TableRow key={setIndex}>
                              <TableCell>{setIndex + 1}</TableCell>
                              <TableCell>
                                <Controller
                                  name={`exercises.${index}.sets.${setIndex}.${
                                    measurementUnits[0]
                                      .fieldName as MeasurementType
                                  }`}
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
                                  name={`exercises.${index}.sets.${setIndex}.${
                                    measurementUnits[1]
                                      .fieldName as MeasurementType
                                  }`}
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
                onClick={cancelEdit}
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

export default WorkoutEdit
