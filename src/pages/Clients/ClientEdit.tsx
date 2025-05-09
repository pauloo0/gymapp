import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useNavigate, useParams } from 'react-router'
import { useState, useEffect } from 'react'

import axios from 'axios'
import { Client, ClientLocation, Package } from '@/utils/interfaces'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'
import { Save, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const emptyClient: Client = {
  id: '',
  firstname: '',
  lastname: '',
  gender: '',
  phone_number: '',
  join_date: '',
  birthday: '',
  goal: '',
  trainer_id: '',
  active: false,
  users: {
    id: '',
    email: '',
  },
  client_locations: {
    id: '',
    trainer_id: '',
    location: '',
    color_hex: '',
    associatedClients: 0,
  },
  subscriptions: [
    {
      id: '',
      start_date: '',
      active: false,
      packages: {
        id: '',
        name: '',
        price: 0,
        duration: 0,
        days_per_month: 0,
        active: false,
      },
    },
  ],
}

const emptyPackages: Package[] = [
  {
    id: '',
    name: '',
    price: 0,
    duration: 0,
    days_per_month: 0,
    active: false,
  },
]

const formSchema = z.object({
  firstname: z.string().max(60, { message: 'Nome muito extenso.' }),
  lastname: z.string().max(60, { message: 'Nome muito extenso.' }),
  gender: z.string().max(20, { message: 'Genero muito extenso.' }),
  phone_number: z
    .string()
    .max(30, { message: 'Número de telefone muito extenso.' }),
  birthday: z.date(),
  join_date: z.date(),
  goal: z.string().max(255, { message: 'Objetivo muito extenso.' }),
  active: z.boolean(),
  package_id: z.string(),
  location_id: z.string(),
})

const ClientEdit = () => {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const { id } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [trainerPackages, setTrainerPackages] =
    useState<Package[]>(emptyPackages)
  const [clientLocations, setClientLocations] = useState<ClientLocation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  )

  const [client, setClient] = useState(emptyClient)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      gender: '',
      phone_number: '',
      birthday: new Date(),
      join_date: new Date(),
      goal: '',
      active: true,
      package_id: '',
      location_id: '',
    },
  })

  const apiUrl: string = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const [resClient, resTrainerPackages, resClientLocations] =
          await Promise.all([
            axios.get(`${apiUrl}/clients/${id}`, {
              headers: {
                'Auth-Token': token,
              },
            }),
            axios.get(`${apiUrl}/packages`, {
              headers: {
                'Auth-Token': token,
              },
            }),
            axios.get(`${apiUrl}/client-locations`, {
              headers: {
                'Auth-Token': token,
              },
            }),
          ])

        const client: Client = resClient.data.client
        setClient(client)
        setTrainerPackages(resTrainerPackages.data.packages)
        setClientLocations(resClientLocations.data.locations)

        form.reset({
          ...client,
          birthday: new Date(client.birthday),
          join_date: new Date(client.join_date),
          package_id: client.subscriptions[0].packages.id,
          location_id: client.client_locations.id,
        })
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
          console.error(error.response?.status)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
      setIsLoading(false)
    }

    fetchClientInfo()
  }, [token, id, apiUrl, form])

  const cancelEdit = () => {
    navigate(`/cliente/${id}`)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const clientInfo = {
      id: id,
      firstname: values.firstname,
      lastname: values.lastname,
      gender: values.gender,
      phone_number: values.phone_number,
      active: values.active,
      birthday: format(values.birthday, 'yyyy-MM-dd'),
      join_date: format(values.join_date, 'yyyy-MM-dd'),
      goal: values.goal,
      location_id: values.location_id,
    }

    const subscriptionInfo = {
      client_id: id,
      package_id: client.subscriptions[0].packages.id,
      start_date: client.subscriptions[0].start_date,
      active: false,
    }

    const newSubscriptionInfo = {
      client_id: id,
      package_id: values.package_id,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      active: true,
    }

    try {
      const resClient = await axios.put(`${apiUrl}/clients/${id}`, clientInfo, {
        headers: {
          'Auth-Token': token,
        },
      })

      const resChangeSubscription = await axios.put(
        `${apiUrl}/subscriptions/${client.subscriptions[0].id}`,
        subscriptionInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      const resNewSubscription = await axios.post(
        `${apiUrl}/subscriptions`,
        newSubscriptionInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      if (resChangeSubscription.status !== 200) {
        throw new Error('Erro ao inativar subscrição antiga.')
      }

      if (resNewSubscription.status !== 201) {
        throw new Error('Erro ao subscrever ao novo pacote.')
      }

      if (resClient.status !== 200) {
        console.error(resClient.data)
        throw new Error(resClient.data)
      }

      setSuccessMessage('Alterações gravadas com sucesso!')
      setIsLoading(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        setErrorMessage(`Erro inexperado: ${error}`)
        console.error('An unexpected error occurred:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Return to client list if client is not found
  if ((!isLoading && client.id === '') || !id) {
    navigate('/clientes')
  }

  useEffect(() => {
    if (errorMessage) setIsDialogOpen(true)
  }, [errorMessage])

  useEffect(() => {
    if (successMessage) setIsDialogOpen(true)
  }, [successMessage])

  const handleSuccessClose = () => {
    setIsDialogOpen(false)
    navigate(`/cliente/${client.id}`)
  }

  if (isLoading) {
    return <Loading />
  }
  if (!trainerPackages) navigate(`/cliente/${client.id}`)

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <h1 className='mb-6 text-xl'>
          Editar cliente {client.firstname + ' ' + client.lastname}
        </h1>

        {successMessage && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open}>
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Erro</DialogTitle>
                <DialogDescription>
                  O cliente deve entrar pela primeira vez com esta password.
                </DialogDescription>
              </DialogHeader>
              {errorMessage}
              <DialogFooter>
                <Button
                  type='button'
                  variant={'default'}
                  onClick={() => setIsDialogOpen(false)}
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
            <FormField
              control={form.control}
              name='firstname'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input className='w-full' type='text' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastname'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome</FormLabel>
                  <FormControl>
                    <Input className='w-full' type='text' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
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
                      <SelectItem value='Masculino'>Masculino</SelectItem>
                      <SelectItem value='Feminino'>Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telemóvel</FormLabel>
                  <FormControl>
                    <Input className='w-full' type='text' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='birthday'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-between pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'yyyy/MM/dd')
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className='w-4 h-4 ml-auto opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-0 border-gray-800'
                      align='start'
                    >
                      <Calendar
                        defaultMonth={new Date(field.value)}
                        captionLayout='dropdown-buttons'
                        locale={pt}
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
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
              name='join_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de entrada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-between pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'yyyy/MM/dd')
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className='w-4 h-4 ml-auto opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-0 border-gray-800'
                      align='start'
                    >
                      <Calendar
                        defaultMonth={new Date(field.value)}
                        captionLayout='dropdown-buttons'
                        locale={pt}
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
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
              name='active'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 -space-y-0.5'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='leading-none'>
                    <FormLabel>Cliente ativo</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='col-span-2'>
              <FormField
                control={form.control}
                name='goal'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='col-span-2'>
              <FormField
                control={form.control}
                name='package_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pacote</FormLabel>
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
                        {trainerPackages &&
                          trainerPackages.map((trainerPackage) => (
                            <SelectItem
                              key={trainerPackage.id}
                              value={trainerPackage.id}
                            >
                              {trainerPackage.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='col-span-2'>
              <FormField
                control={form.control}
                name='location_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
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
                        {clientLocations &&
                          clientLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.location}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 col-span-2 gap-2'>
              <Button
                type='submit'
                size={'sm'}
                className='flex items-center justify-center px-3'
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

export default ClientEdit
