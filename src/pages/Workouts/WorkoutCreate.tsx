import { useState, useEffect } from 'react'
import axios from 'axios'

import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Client, Exercise } from '@/utils/interfaces'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

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

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import { cn } from '@/lib/utils'
import { Plus, Save, X } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  client_id: z.string(),
  name: z.string().max(30, {
    message: 'O nome deve ter no maúximo 30 caracteres.',
  }),
  active: z.boolean().default(true),
  public: z.boolean().default(false),
  exercises: z.array(
    z.object({
      exercise_id: z.string(),
      sets: z.number(),
      reps: z.number(),
    })
  ),
})

function WorkoutCreate() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [dbExercises, setDbExercises] = useState<Exercise[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [addedExercises, setAddedExercises] = useState<Exercise[]>([])
  const [exercisesDrawerOpen, setExercisesDrawerOpen] = useState<boolean>(false)

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

    fetchDbExercises()
    fetchClients()
  }, [token])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: '',
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

  const cancelCreate = () => {
    window.location.href = '/treinos'
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const workoutInfo = {
      ...values,
      exercises: addedExercises.map((exercise) => ({
        exercise_id: exercise.id,
        sets: values.exercises.filter((ex) => ex.exercise_id === exercise.id)[0]
          .sets,
        reps: values.exercises.filter((ex) => ex.exercise_id === exercise.id)[0]
          .reps,
      })),
    }

    console.log(workoutInfo)
  }

  const handleAddExercises = () => {
    setExercisesDrawerOpen(!exercisesDrawerOpen)

    if (!exercisesDrawerOpen) setAddedExercises([])
  }

  if (isLoading) return <Loading />

  return (
    <>
      <Navbar />
      <h1 className='mb-6 text-xl'>Criar plano de treino</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='grid grid-cols-2 gap-4'
        >
          <div className='col-span-2'>
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
                    <SelectContent>
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
                <DrawerTitle>Exercícios</DrawerTitle>
              </DrawerHeader>

              {dbExercises.map((exercise) => (
                <div key={exercise.id}>{exercise.name}</div>
              ))}
            </DrawerContent>
          </Drawer>

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
