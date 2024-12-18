import { useState } from 'react'

import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'
import { Save, X } from 'lucide-react'

import { cn } from '@/lib/utils'

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

const formSchema = z.object({
  name: z.string(),
  price: z.number(),
  days_per_week: z.number(),
})

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function PackageCreate() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      days_per_week: 0,
    },
  })

  const cancelCreate = () => {
    window.history.back()
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const packageInfo = { ...values }

    try {
      const res = await axios.post(`${apiUrl}/packages`, packageInfo, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (res.status === 201) {
        alert('Pacote criado com sucesso!')
        window.location.href = '/pacotes'
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data)
        setErrorMessage(error.response?.data)
      } else {
        console.error('An unexpected error occurred.', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <Navbar />
      <h1 className='mb-6 text-xl'>Criar pacote</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='grid grid-cols-2 gap-4'
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
                    Nome
                  </FormLabel>
                  <FormControl>
                    <Input
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
          </div>

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`${errorMessage ? 'text-red-500' : ''}`}>
                  Preço (€)
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    className={`w-full ${errorMessage ? 'border-red-500' : ''}`}
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
            name='days_per_week'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`${errorMessage ? 'text-red-500' : ''}`}>
                  Dias p/ semana
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    className={`w-full ${errorMessage ? 'border-red-500' : ''}`}
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
                'flex items-center justify-center px-3 bg-green-600 hover:bg-green-700',
                isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
              disabled={isLoading}
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

export default PackageCreate
