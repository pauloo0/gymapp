import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import { Link } from 'react-router-dom'

const isEmail = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}')

const formSchema = z.object({
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

function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className='w-full'
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
                  <Input
                    className='w-full'
                    placeholder='Palavra-passe'
                    type='password'
                    {...field}
                  />
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
                  <Input
                    className='w-full'
                    placeholder='Confirmar palavra-passe'
                    type='password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className='w-full' type='submit'>
            Criar conta
          </Button>
        </form>
      </Form>
      <p className='my-2'>
        Ja tem uma conta? Faça o{' '}
        <Link className='text-blue-600 underline' to='/'>
          Login
        </Link>{' '}
      </p>
    </>
  )
}

export default Register
