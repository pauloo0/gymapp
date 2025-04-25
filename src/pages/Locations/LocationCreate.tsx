import { useState } from 'react'

import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import TrainerNavbar from '@/components/TrainerNavbar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import locationColors from '@/utils/locationColors'

const colorHexRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/

const formSchema = z.object({
  location: z.string(),
  color_hex: z.string().max(7).regex(colorHexRegex),
})

const apiUrl: string = import.meta.env.VITE_API_URL || ''

export default function LocationCreate() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      color_hex: '',
    },
  })

  const cancelCreate = () => {
    window.history.back()
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      const res = await axios.post(`${apiUrl}/client-locations`, values, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (res.status === 201) {
        window.location.href = '/localizacoes'
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)]'>
        <h1 className='mb-6 text-xl'>Editar localização</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col w-full gap-4'
          >
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
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

            <FormField
              control={form.control}
              name='color_hex'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
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
                      {locationColors.map((color, idx) => (
                        <SelectItem key={idx} value={color} className='p-2'>
                          <div
                            className='h-6 rounded-lg w-72 sm:w-96 '
                            style={{ backgroundColor: '#' + color }}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 col-span-3 gap-2'>
              <Button
                type='submit'
                size={'sm'}
                className={cn(
                  'flex items-center justify-center px-3',
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
      </main>
    </>
  )
}
