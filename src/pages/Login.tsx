import axios from 'axios'
import { setToken } from '@/utils/tokenWrapper'

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

import { Link } from 'react-router-dom'
import { useState } from 'react'

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
  const [errorMessage, setErrorMessage] = useState<null | string>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await axios.post(
        'http://localhost:3000/api/user/login',
        values
      )

      setToken(res.data as string)
      window.location.href = '/'
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.log(error.response?.status)
        // console.log(error.response?.data)
        setErrorMessage(error.response?.data)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-2/3 space-y-2'
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
                    className={`w-full ${errorMessage ? 'border-red-500' : ''}`}
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
          <Button className='w-full' type='submit'>
            Iniciar sessão
          </Button>
        </form>
      </Form>
      <p className='my-2'>
        Ainda não tem conta?
        <Link className='text-blue-600 underline' to='/register'>
          Crie uma nova.
        </Link>
      </p>
    </>
  )
}

export default Login
