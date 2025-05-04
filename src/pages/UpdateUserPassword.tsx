import { useState } from 'react'
import axios from 'axios'
import { setToken } from '@/utils/tokenWrapper'
import { setUser } from '@/utils/userWrapper'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import logo from '@/assets/logo.svg'

const formSchema = z
  .object({
    password: z.string().min(6, {
      message: 'A palavra-passe deve ter mais que 6 caracteres.',
    }),
    password_confirm: z.string().min(6, {
      message: 'A palavra-passe deve ter mais que 6 caracteres.',
    }),
  })
  .superRefine(({ password, password_confirm: passwordConfirm }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        code: 'custom',
        message: 'As palavras-passe não correspondem.',
        path: ['passwordConfirm'],
      })
    }
  })

interface UserInfo {
  message: string
  isOTP: boolean
  token: string
  role: string
  user: string
}

function UpdateUserPassword({ userInfo }: { userInfo: UserInfo }) {
  const { token, user, role } = userInfo

  const [errorMessage, setErrorMessage] = useState<null | string>(null)

  const apiUrl: string = import.meta.env.VITE_API_URL || ''

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      password_confirm: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await axios.put(`${apiUrl}/user/update-password`, values, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (res.status === 200) {
        setToken(token)
        setUser({ userId: user, role: role })

        window.location.href = '/'
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    }
  }

  return (
    <main className='flex flex-col items-center justify-center min-h-screen'>
      <img src={logo} alt='TraynLab' width={'350px'} className='mb-8' />
      <h1 className='text-2xl font-bold'>Atualizar Palavra-Passe</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col w-full gap-2 p-4 sm:w-[500px]'
        >
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`${errorMessage ? 'text-red-500' : ''}`}>
                  Palavra-Passe
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    className={`w-full ${errorMessage ? 'border-red-500' : ''}`}
                    placeholder='Palavra-Passe'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password_confirm'
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`${errorMessage ? 'text-red-500' : ''}`}>
                  Confirmar Palavra-Passe
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    className={`w-full ${errorMessage ? 'border-red-500' : ''}`}
                    placeholder='Confirmar Palavra-Passe'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='my-4'>
            <Button className='w-full' type='submit'>
              Gravar
            </Button>
          </div>
        </form>
      </Form>
    </main>
  )
}

export default UpdateUserPassword
