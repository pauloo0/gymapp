import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router'

import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Client } from '@/utils/interfaces'
import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'

import { Save, X, Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

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

const formSchema = z.object({
  date: z.date(),
  time: z.string(),
})

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function ScheduleEdit() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  // Client id from URL
  const { schedule_id } = useParams()

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      time: '',
    },
  })

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/schedule/${schedule_id}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const schedule = res.data.appointment[0]

        form.reset({
          date: new Date(format(schedule.date, 'yyyy/MM/dd')),
          time: schedule.time,
        })

        const resClient = await axios.get(
          `${apiUrl}/clients/${schedule.clients.id}`,
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        setClient(resClient.data.client)
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

    fetchSchedule()
  }, [schedule_id, token, form])

  const cancelEdit = () => {
    window.location.href = `/marcacao/${schedule_id}`
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const updatedScheduleInfo = {
      ...values,
      client_id: client?.id,
    }

    try {
      const resUpdatedSchedule = await axios.put(
        `${apiUrl}/schedule/${schedule_id}`,
        updatedScheduleInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      if (resUpdatedSchedule.status === 201) {
        window.location.href = `/marcacao/${schedule_id}`
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.status)
        console.error(error.response?.data)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <Loading />

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)]'>
        <h1 className='mb-6 text-xl'>Editar agendamento</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-2 gap-4'
          >
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

export default ScheduleEdit
