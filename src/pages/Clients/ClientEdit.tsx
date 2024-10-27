import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useParams } from 'react-router'
import { useState, useEffect } from 'react'

import axios from 'axios'
import { Client, Package } from '@/utils/interfaces'

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

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'
import { Save, X } from 'lucide-react'

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
  subscriptions: [
    {
      id: '',
      start_date: '',
      active: false,
      packages: {
        id: '',
        name: '',
        days_per_week: 0,
        price: 0,
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
    days_per_week: 0,
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
})

const ClientEdit = () => {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { id } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [trainerPackages, setTrainerPackages] =
    useState<Package[]>(emptyPackages)
  const [client, setClient] = useState(emptyClient)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: client.firstname,
      lastname: client.lastname,
      gender: client.gender,
      phone_number: client.phone_number,
      birthday: new Date(client.birthday),
      join_date: new Date(client.join_date),
      goal: client.goal,
      active: client.active,
      package_id: client.subscriptions[0].packages.id,
    },
  })

  const apiUrl: string = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const fetchTrainerPackages = async () => {
      try {
        const res = await axios.get(`${apiUrl}/packages`, {
          headers: {
            'Auth-Token': token,
          },
        })

        setTrainerPackages(res.data.packages)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    const fetchClientInfo = async () => {
      try {
        const res = await axios.get(`${apiUrl}/clients/${id}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const client: Client =
          res.status === 204 ? emptyClient : res.data.client

        setClient(client)
        form.reset({
          ...client,
          birthday: new Date(client.birthday),
          join_date: new Date(client.join_date),
          package_id:
            client.subscriptions.length > 0
              ? client.subscriptions[0].packages.id
              : '',
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

    fetchTrainerPackages()
    fetchClientInfo()
  }, [token, id, apiUrl, form])

  const cancelEdit = () => {
    window.location.href = `/cliente/${id}`
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const clientInfo = {
      ...values,
      birthday: format(values.birthday, 'yyyy-MM-dd'),
      join_date: format(values.join_date, 'yyyy-MM-dd'),
    }

    try {
      const res = await axios.put(`${apiUrl}/clients/${id}`, clientInfo, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (res.status === 200) {
        window.location.href = `/cliente/${id}`
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data)
        console.error(error.response?.status)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    }
  }

  // Return to client list if client is not found
  if ((!isLoading && client.id === '') || !id) {
    window.location.href = '/clientes'
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <Navbar />
      <h1 className='mb-6 text-xl'>
        Editar cliente {client.firstname + ' ' + client.lastname}
      </h1>
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
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      defaultMonth={new Date(field.value)}
                      captionLayout='dropdown-buttons'
                      locale={pt}
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
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
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      defaultMonth={new Date(field.value)}
                      captionLayout='dropdown-buttons'
                      locale={pt}
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
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
                      {/* <SelectItem value='35aac01e-69a9-4bac-8a07-6927d620721e'>
                        2 times a week
                      </SelectItem> */}
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
              className='flex items-center justify-center px-3 bg-green-600 hover:bg-green-700'
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
    </>
  )
}

export default ClientEdit
