import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Client, Package } from '@/utils/interfaces'

import Navbar from '@/components/Navbar'
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
import { Textarea } from '@/components/ui/textarea'
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
import Loading from '@/components/reusable/Loading'

import { v4 as uuid } from 'uuid'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DialogClose } from '@radix-ui/react-dialog'

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
  subscriptions: {
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
  birthday: z.date(),
  phone_number: z
    .string()
    .max(30, { message: 'Número de telefone muito extenso.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  goal: z.string().max(255, { message: 'Objetivo muito extenso.' }),
  package_id: z.string(),
})

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function ClientCreate() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [isLoading, setIsLoading] = useState(true)
  const [trainerPackages, setTrainerPackages] =
    useState<Package[]>(emptyPackages)
  const [otp, setOtp] = useState<string | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: emptyClient.firstname,
      lastname: emptyClient.lastname,
      gender: emptyClient.gender,
      birthday: new Date(),
      phone_number: emptyClient.phone_number,
      email: emptyClient.users.email,
      goal: emptyClient.goal,
      package_id: emptyClient.subscriptions.packages.id,
    },
  })

  const cancelCreate = () => {
    window.location.href = '/clientes'
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const client_id: string = uuid()

    const clientInfo = {
      id: client_id,
      firstname: values.firstname,
      lastname: values.lastname,
      gender: values.gender,
      phone_number: values.phone_number,
      email: values.email,
      birthday: format(values.birthday, 'yyyy-MM-dd'),
      join_date: format(new Date(), 'yyyy-MM-dd'),
      goal: values.goal,
    }

    const subscriptionInfo = {
      client_id: client_id,
      package_id: values.package_id,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      active: true,
    }

    try {
      const resClient = await axios.post(`${apiUrl}/clients`, clientInfo, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (resClient.status !== 201) {
        throw new Error('Erro a criar cliente')
      }

      const resSubscription = await axios.post(
        `${apiUrl}/subscriptions`,
        subscriptionInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      if (resSubscription.status !== 201) {
        throw new Error('Erro a criar subscrições para o cliente')
      }

      setIsLoading(false)

      // TODO: Send email to client with link to website and One-Time-Password sent by the API
      setOtp(resClient.data.password)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data)
        console.error(error.response?.status)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    }
  }

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

      setIsLoading(false)
    }

    fetchTrainerPackages()
  }, [token])

  useEffect(() => {
    if (otp) setIsDialogOpen(true)
  }, [otp])

  const handleRedirect = () => {
    window.location.href = `/clientes`
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <Navbar />
      <h1 className='mb-6 text-xl'>Criar novo cliente</h1>

      {otp && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && handleRedirect()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Password temporária</DialogTitle>
              <DialogDescription>
                O cliente deve entrar pela primeira vez com esta password.
              </DialogDescription>
            </DialogHeader>
            {otp}
          </DialogContent>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='secondary'>
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
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
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input className='w-full' type='email' {...field} />
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
                          'w-full justify-start text-left font-normal',
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
                      defaultMonth={new Date()}
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
    </div>
  )
}

export default ClientCreate
