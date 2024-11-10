import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'

import {
  Workout,
  Bodypart,
  Client,
  Equipment,
  Exercise,
  WorkoutExercise,
} from '@/utils/interfaces'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'
import WorkoutAddExercises from '@/pages/Workouts/WorkoutAddExercises'

import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Ellipsis, Plus, Save, X } from 'lucide-react'

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

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  name: z.string().trim().nonempty('O nome é obrigatório.').max(30, {
    message: 'O nome deve ter no maúximo 30 caracteres.',
  }),
  active: z.boolean().default(true),
  public: z.boolean().default(false),
  exercises: z
    .array(
      z.object({
        exercise_id: z.string(),
        sets: z.number().min(1, {
          message: 'O valor deve ser maior que 0.',
        }),
        reps: z.number().min(1, {
          message: 'O valor deve ser maior que 0.',
        }),
      })
    )
    .min(1, { message: 'O plano deve ter pelo menos um exercício.' }),
})

function WorkoutCreate() {
  const { workout_id } = useParams()
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)

  const [dbExercises, setDbExercises] = useState<Exercise[]>([])
  const [bodyparts, setBodyparts] = useState<Bodypart[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  const [addedExercises, setAddedExercises] = useState<Exercise[]>([])
  const [exercisesDrawerOpen, setExercisesDrawerOpen] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      active: true,
      public: false,
      exercises: [
        {
          exercise_id: '',
          sets: 0,
          reps: 0,
        },
      ],
    },
  })

  const { fields, remove, swap } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  // Fetch data from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resWorkout = await axios.get(`${apiUrl}/workouts/${workout_id}`, {
          headers: {
            'Auth-Token': token,
          },
        })
        const workout = resWorkout.data.workout
        setCurrentWorkout(workout)

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

        // Fetch remaining data from DB
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

        // Set initial form values
        const initialExercises = workout.workout_exercises.map(
          (ex: WorkoutExercise) => ({
            exercise_id: ex.exercises.id,
            sets: ex.sets,
            reps: ex.reps,
          })
        )

        form.reset({
          name: workout.name,
          active: workout.active,
          public: workout.public,
          exercises: initialExercises,
        })

        // Set initial added exercises
        setAddedExercises(
          workout.workout_exercises.map((ex: WorkoutExercise) => ex.exercises)
        )

        setIsLoading(false)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    fetchData()
  }, [token, workout_id, form])

  // Sync addedExercises with form fields
  useEffect(() => {
    const minimumSets = 1
    const minimumReps = 1

    const newExercises = addedExercises.map((exercise) => ({
      exercise_id: exercise.id,
      sets: currentWorkout
        ? currentWorkout?.workout_exercises.find(
            (ex) => ex.exercises.id === exercise.id
          )?.sets ?? minimumSets
        : minimumSets,
      reps: currentWorkout
        ? currentWorkout?.workout_exercises.find(
            (ex) => ex.exercises.id === exercise.id
          )?.reps ?? minimumReps
        : minimumReps,
    }))

    form.setValue('exercises', newExercises)
  }, [addedExercises, form, currentWorkout])

  const cancelCreate = () => {
    window.location.href = '/treinos'
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const updatedWorkoutInfo = {
      ...values,
      client_id: currentClient?.id,
      exercises: values.exercises.map((exercise) => ({
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
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

      if (resUpdatedWorkout.status === 201) {
        window.location.href = `/treino/${workout_id}`
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.status)
        console.error(error.response?.data)
      } else {
        console.error('An unexpected error occurred:', error)
      }

      setIsLoading(false)
    }
  }

  const removeExercise = (id: string, index: number) => {
    remove(index) // Removes from form fields
    setAddedExercises(addedExercises.filter((exercise) => exercise.id !== id)) // Removes from state variable
  }

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1

    swap(index, newIndex) // Updates form field's order

    // Update state variable's order
    const newOrderedExercises = [...addedExercises]
    const temp = newOrderedExercises[index]
    newOrderedExercises[index] = newOrderedExercises[newIndex]
    newOrderedExercises[newIndex] = temp
    setAddedExercises(newOrderedExercises)
  }

  const handleAddExercises = () => {
    setExercisesDrawerOpen(!exercisesDrawerOpen)
  }

  if (isLoading) return <Loading />

  return (
    <>
      <Navbar />
      <h1 className='mb-6 text-xl'>
        Editar plano de treino
        {currentClient &&
          ' de ' + currentClient.firstname + ' ' + currentClient.lastname}
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='grid grid-cols-2 gap-2'
        >
          <div className='col-span-2'>
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
          </div>

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

          <Drawer
            open={exercisesDrawerOpen}
            onOpenChange={() => handleAddExercises()}
          >
            <DrawerTrigger asChild className='col-span-2'>
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
                dbExercises={dbExercises}
                addedExercises={addedExercises}
                setAddedExercises={setAddedExercises}
                handleOpenClose={handleAddExercises}
                bodyparts={bodyparts}
                equipment={equipment}
              />
            </DrawerContent>
          </Drawer>

          {fields.length > 0 && (
            <div className='flex flex-col col-span-2 gap-2 overflow-y-auto max-h-96'>
              {fields.map((field, index) => {
                const exercise = form.getValues(`exercises.${index}`)
                const isFirst = index === 0
                const isLast = index === fields.length - 1

                return (
                  <div
                    key={field.id}
                    className='flex flex-col px-3 py-2 border rounded-md'
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
                            onClick={() =>
                              removeExercise(exercise.exercise_id, index)
                            }
                          >
                            <X className='w-4 h-4 mr-1' />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className='grid grid-cols-2 gap-1'>
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.sets`}
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-center justify-start space-x-2'>
                            <FormLabel>Sets</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='Sets'
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                className='w-20 h-8'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.reps`}
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-center justify-start space-x-2'>
                            <FormLabel>Reps</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='Reps'
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                className='w-20 h-8'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                'flex items-center justify-center px-3 bg-green-600 hover:bg-green-700',
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
    </>
  )
}

export default WorkoutCreate
