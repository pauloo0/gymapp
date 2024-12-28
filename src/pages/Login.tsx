import axios from 'axios'
import { setToken, useToken } from '@/utils/tokenWrapper'
import { setUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useEffect, useState } from 'react'
import UpdateUserPassword from './UpdateUserPassword'

const isEmail = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}')

const formSchema = z.object({
  email: z.string().regex(isEmail, {
    message: 'Endereço de email inválido.',
  }),
  password: z.string().min(6, {
    message: 'A palavra-passe deve ter mais que 6 caracteres.',
  }),
})

function Login() {
  const token = useToken()

  if (token) {
    window.location.href = '/'
  }

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [passwordUpdateRequired, setPasswordUpdateRequired] = useState<
    boolean | undefined
  >(undefined)
  const [userInfo, setUserInfo] = useState({
    message: '',
    isOTP: false,
    token: '',
    user: '',
    role: '',
  })

  const apiUrl: string = import.meta.env.VITE_API_URL || ''

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await axios.post(`${apiUrl}/user/login`, values)

      setPasswordUpdateRequired(res.data.isOTP)
      setUserInfo(res.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    }
  }

  useEffect(() => {
    if (passwordUpdateRequired == false) {
      setToken(userInfo.token as string)
      setUser({ userId: userInfo.user, role: userInfo.role })

      window.location.href = '/'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordUpdateRequired])

  if (passwordUpdateRequired) {
    return <UpdateUserPassword userInfo={userInfo} />
  }
  return (
    <div className='flex flex-col justify-center w-full'>
      <h1 className='mb-6 text-2xl font-bold text-start'>Iniciar sessão</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col w-full space-y-2'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`${errorMessage ? 'text-red-500' : ''}`}>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    className={`${errorMessage ? 'border-red-500' : ''}`}
                    placeholder='email@exemplo.pt'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`${errorMessage ? 'text-red-500' : ''}`}>
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    className={`w-full ${errorMessage ? 'border-red-500' : ''}`}
                    placeholder='Palavra-passe'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage && (
            <FormDescription className='text-red-500'>
              {errorMessage}
            </FormDescription>
          )}

          <div className='my-4'>
            <Button className='w-full' type='submit'>
              Iniciar sessão
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Login
