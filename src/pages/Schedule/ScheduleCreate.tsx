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

import { Client } from '@/utils/interfaces'

import Navbar from '@/components/Navbar'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useParams } from 'react-router'

const formSchema = z.object({
  client_id: z.string().nonempty('O cliente deve estar preenchido.'),
  date: z.date(),
  time: z.string(),
})

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function ScheduleCreate() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  // Client Id from URL
  const { client_id } = useParams()

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: client_id ? client_id : '',
      date: new Date(),
      time: '',
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

  const cancelCreate = () => {
    window.history.back()
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const scheduleInfo = {
      ...values,
      date: format(values.date, 'yyyy-MM-dd'),
    }

    try {
      const res = await axios.post(`${apiUrl}/schedule`, scheduleInfo, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (res.status !== 201) {
        throw new Error('Erro a criar marcação')
      }

      alert('Marcação criada com sucesso!')
      window.location.href = '/marcacoes'
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data.message)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (errorMessage) setIsDialogOpen(true)
  }, [errorMessage])

  if (isLoading) return <Loading />

  return (
    <>
      <Navbar />

      <main className='min-h-[calc(100vh_-_64px)]'>
        <h1 className='mb-6 text-xl'>Criar marcação</h1>

        {errorMessage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Erro</DialogTitle>
                <DialogDescription>{errorMessage}</DialogDescription>
              </DialogHeader>
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
