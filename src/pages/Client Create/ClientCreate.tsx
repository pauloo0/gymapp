import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Client } from '@/utils/interfaces'

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
}

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
})

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function ClientCreate() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [isLoading, setIsLoading] = useState(false)

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
    },
  })

  const cancelCreate = () => {
    window.location.href = '/clientes'
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const clientInfo = {
      ...values,
      birthday: format(values.birthday, 'yyyy-MM-dd'),
      join_date: format(new Date(), 'yyyy-MM-dd'),
    }

    try {
      const res = await axios.post(`${apiUrl}/clients`, clientInfo, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (res.status !== 201) {
        throw new Error('Erro a criar cliente')
      }

      setIsLoading(false)

      // TODO: Send email to client with link to website and One-Time-Password sent by the API
      window.location.href = `/clientes`
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data)
        console.error(error.response?.status)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    }
  }

  return (
    <div>
      <Navbar />
      <h1 className='mb-6 text-xl'>Criar novo cliente</h1>

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
