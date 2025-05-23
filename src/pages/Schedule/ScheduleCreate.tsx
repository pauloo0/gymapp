import { useState, useEffect } from 'react'

import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Client, Workout } from '@/utils/interfaces'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'
import { Save, X } from 'lucide-react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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

import { useNavigate, useParams } from 'react-router'

const formSchema = z.object({
  client_id: z.string().nonempty('O cliente deve estar preenchido.'),
  date: z.date(),
  time: z.string(),
  workout_id: z.string().nullable(),
  repeat_type: z.enum(['no_repeat', 'weekly', 'biweekly', 'monthly']),
})

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function ScheduleCreate() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  // Client Id from URL
  const { client_id } = useParams()

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [clientWorkouts, setClientWorkouts] = useState<Workout[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: client_id ? client_id : '',
      date: new Date(),
      time: '',
      workout_id: '',
      repeat_type: 'no_repeat',
    },
  })

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${apiUrl}/clients`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const clients = res.data.clients.sort(
          (clientA: Client, clientB: Client) => {
            const active = clientA.active ? 1 : 0
            const active2 = clientB.active ? 1 : 0
            return active - active2
          }
        )

        setClients(clients)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }

      setIsLoading(false)
    }

    fetchClients()
  }, [token])

  useEffect(() => {
    const fetchClientWorkouts = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/workouts/all`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const workouts: Workout[] = res.data.workouts
          ? res.data.workouts.filter((workout: Workout) => !workout.public)
          : []

        setClientWorkouts(workouts)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data)
        } else {
          console.error('An unexpected error ocurred.', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientWorkouts()
  }, [token])

  const cancelCreate = () => {
    window.history.back()
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMessage(undefined)
    setIsLoading(true)

    const scheduleInfo = {
      client_id: values.client_id,
      date: format(values.date, 'yyyy-MM-dd'),
      time: values.time,
      workout_id: values.workout_id === '' ? null : values.workout_id,
      repeating: values.repeat_type !== 'no_repeat',
      repeat_type: values.repeat_type,
    }

    try {
      const resSchedule = await axios.post(`${apiUrl}/schedule`, scheduleInfo, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (resSchedule.status !== 201) {
        console.error(resSchedule.data)
        throw new Error(resSchedule.data)
      }

      setErrorMessage(undefined)
      setSuccessMessage('Agendamento criado com sucesso!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data.message)
      } else {
        setErrorMessage(`Erro inesperado: ${error}`)
        console.error('An unexpected error occurred:', error)
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
    navigate('/marcacoes')
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
        <h1 className='mb-6 text-xl'>Criar marcação</h1>

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
                      onValueChange={(value) => {
                        field.onChange(value)

                        setClientWorkouts((prev) => {
                          return prev.filter(
                            (workout) => workout.clients.id === value
                          )
                        })
                      }}
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
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage ? 'text-red-500' : ''}`}
                  >
                    Data
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                            errorMessage ? 'border-red-500' : ''
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'yyyy/MM/dd')
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className='w-4 h-4 ml-2 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-0 border-gray-800'
                      align='start'
                    >
                      <Calendar
                        defaultMonth={new Date()}
                        captionLayout='dropdown-buttons'
                        locale={pt}
                        fromYear={new Date().getFullYear()}
                        toYear={new Date().getFullYear() + 1}
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        className='bg-gray-900 rounded'
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage ? 'text-red-500' : ''}`}
                  >
                    Hora
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='time'
                      step='60'
                      lang='pt-PT'
                      className={`w-full ${
                        errorMessage ? 'border-red-500' : ''
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='repeat_type'
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Repetir</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={'no_repeat'}>Não repetir</SelectItem>
                      <SelectItem value={'weekly'}>Todas as semanas</SelectItem>
                      <SelectItem value={'biweekly'}>
                        A cada duas semanas
                      </SelectItem>
                      <SelectItem value={'monthly'}>Todos os meses</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='col-span-2'>
              <FormField
                control={form.control}
                name='workout_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano de treino</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientWorkouts.length > 0 ? (
                          clientWorkouts.map((workout) => (
                            <SelectItem key={workout.id} value={workout.id}>
                              {workout.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value={'none'}>
                            Sem planos de treino
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 col-span-2 gap-2 mt-2'>
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

export default ScheduleCreate
