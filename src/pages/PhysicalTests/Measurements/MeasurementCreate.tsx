import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useNavigate, useParams } from 'react-router'
import { useEffect, useState } from 'react'

import axios from 'axios'
import { Client } from '@/utils/interfaces'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'
import { Save, X, Calendar as CalendarIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  client_id: z.string(),
  date: z.date(),
  weight: z.number(),
  height: z.number(),
  body_fat_pct: z.number(),
  body_fat: z.number(),
  muscle_mass_pct: z.number(),
  muscle_mass: z.number(),
  water_pct: z.number(),
  bmi: z.number(),
  visceral_fat: z.number(),
  chest: z.number(),
  waist: z.number(),
  hip: z.number(),
  leftthigh: z.number(),
  rightthigh: z.number(),
  leftarm: z.number(),
  rightarm: z.number(),
  leftcalf: z.number(),
  rightcalf: z.number(),
})

function MeasurementCreate() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const { client_id } = useParams()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  )
  const [clients, setClients] = useState<Client[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: client_id ? client_id : '',
      date: new Date(),
      weight: 0,
      height: 0,
      body_fat_pct: 0,
      body_fat: 0,
      muscle_mass_pct: 0,
      muscle_mass: 0,
      water_pct: 0,
      bmi: 0,
      visceral_fat: 0,
      chest: 0,
      waist: 0,
      hip: 0,
      leftthigh: 0,
      rightthigh: 0,
      leftarm: 0,
      rightarm: 0,
      leftcalf: 0,
      rightcalf: 0,
    },
  })

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const resClients = await axios.get(`${apiUrl}/clients/`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const clients = resClients.data.clients
        setClients(clients)
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

    fetchClients()
  }, [token])

  const cancelCreate = () => {
    navigate(`/avaliacoes/antropometricos/`)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMessage(undefined)
    setIsLoading(true)

    const measurementInfo = {
      ...values,
      date: format(values.date, 'yyyy-MM-dd'),
    }

    try {
      const resMeasurement = await axios.post(
        `${apiUrl}/measurements`,
        measurementInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      if (resMeasurement.status !== 201) {
        console.error(resMeasurement.data)
        setErrorMessage(resMeasurement.data)
      }

      setErrorMessage(undefined)
      setSuccessMessage('Avaliação antropométrica criada com sucesso!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        setErrorMessage(`Erro inesperado: ${error}`)
        console.error('An unexpected error occurred', error)
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
    navigate('/avaliacoes/antropometricos/')
  }
  const handleErrorClose = () => {
    setIsDialogOpen(false)
    setErrorMessage(undefined)
  }

  if (isLoading) return <Loading />
  if (!clients) setErrorMessage('Não encontrei clientes.')

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <h1 className='mb-6 text-xl'>Nova Avaliação</h1>

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
            onOpenChange={(open) => !open && handleErrorClose()}
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
            className='grid grid-cols-2 gap-4 mb-14'
          >
            <div
              id='measurement-header'
              className='grid grid-cols-1 col-span-2 gap-4'
            >
              <div>
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

              <div>
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
                                !field.value && 'text-gray-50',
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
              </div>
            </div>

            <section className='col-span-2 my-4 font-semibold'>
              <p>Dados gerais</p>
            </section>

            <FormField
              control={form.control}
              name='weight'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage ? 'text-red-500' : ''}`}
                  >
                    Peso
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`w-full ${
                        errorMessage ? 'border-red-500' : ''
                      }`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='height'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Altura
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='body_fat_pct'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Gorda (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='body_fat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Gorda (Kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='muscle_mass_pct'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Muscular (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='muscle_mass'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Muscular (Kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='water_pct'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Água (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='bmi'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    IMC
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='visceral_fat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Gordura Visceral
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <section className='col-span-2 my-4 font-semibold'>
              <p>Perímetros</p>
            </section>

            <FormField
              control={form.control}
              name='chest'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Busto
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='leftarm'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Braço Esquerdo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rightarm'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Braço Direito
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='waist'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Cintura
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='hip'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Anca
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='leftthigh'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Coxa Esquerda
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rightthigh'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Coxa Direita
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='leftcalf'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Gémeo Esquerdo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rightcalf'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Gémeo Direito
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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

export default MeasurementCreate
