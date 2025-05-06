import axios from 'axios'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import Loading from '@/components/reusable/Loading'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Link, useNavigate } from 'react-router-dom'

import logo from '@/assets/logo.svg'

const isEmail = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}')

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z
  .object({
    username: z.string().min(6, {
      message: 'O nome de utilizador deve ter mais que 6 caracteres.',
    }),
    firstname: z.string().min(1, { message: 'O nome é obrigatório.' }),
    lastname: z.string().min(1, { message: 'O sobrenome é obrigatório.' }),
    email: z.string().regex(isEmail, {
      message: 'Endereço de email inválido.',
    }),
    password: z.string().min(6, {
      message: 'A palavra-passe deve ter mais que 6 caracteres.',
    }),
    passwordConfirm: z.string().min(6, {
      message: 'A palavra-passe deve ter mais que 6 caracteres.',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As palavras-passe não coincidem.',
    path: ['passwordConfirm'],
  })

function Register() {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<boolean>(false)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const userValues = {
      username: values.username,
      email: values.email,
      password: values.password,
      role: 'trainer',
      isOTP: false,
      profile: {
        firstname: values.firstname,
        lastname: values.lastname,
      },
    }

    try {
      const res = await axios.post(`${apiUrl}/user/register`, userValues)

      if (res.status === 201) {
        navigate('/login')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <Loading />

  return (
    <main className='flex flex-col items-center justify-center min-h-screen'>
      <img src={logo} alt='TraynLab' width={'200px'} className='mb-8' />
      <h1 className='text-2xl font-bold'>Registar</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col w-full gap-2 p-4 sm:w-[500px]'
        >
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de utilizador</FormLabel>
                <FormControl>
                  <Input placeholder='Nome de utilizador' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='firstname'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder='Nome' {...field} />
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
                  <Input placeholder='Sobrenome' {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='Palavra-passe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='passwordConfirm'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder='Confirmar palavra-passe'
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

          <div className='mt-4'>
            <Button className='w-full' type='submit'>
              Criar conta
            </Button>
          </div>
          <p>
            Ja tem uma conta? Faça o{' '}
            <Link className='text-lime-400 hover:underline' to='/login'>
              Login
            </Link>
          </p>
        </form>
      </Form>
    </main>
  )
}

export default Register
