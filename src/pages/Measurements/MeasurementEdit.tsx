import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useNavigate, useParams } from 'react-router'
import { useEffect, useState } from 'react'

import axios from 'axios'
import { Client, Measurement } from '@/utils/interfaces'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { format } from 'date-fns'
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

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'
import { ArrowLeft, Save, X } from 'lucide-react'

const emptyMeasurement: Measurement = {
  id: '',
  date: '',
  weight: 0,
  height: 0,
  body_fat_pct: 0,
  body_fat: 0,
  muscle_mass_pct: 0,
  muscle_mass: 0,
  water_pct: 0,
  bmi: 0,
  visceral_fat: 0,
  chest: 0,
  waist: 0,
  hip: 0,
  leftthigh: 0,
  rightthigh: 0,
  leftarm: 0,
  rightarm: 0,
  leftcalf: 0,
  rightcalf: 0,
  clients: {
    id: '',
    firstname: '',
    lastname: '',
  },
}

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  weight: z.number(),
  height: z.number(),
  body_fat_pct: z.number(),
  body_fat: z.number(),
  muscle_mass_pct: z.number(),
  muscle_mass: z.number(),
  water_pct: z.number(),
  bmi: z.number(),
  visceral_fat: z.number(),
  chest: z.number(),
  waist: z.number(),
  hip: z.number(),
  leftthigh: z.number(),
  rightthigh: z.number(),
  leftarm: z.number(),
  rightarm: z.number(),
  leftcalf: z.number(),
  rightcalf: z.number(),
})

function MeasurementEdit() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const { measurement_id } = useParams()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [measurement, setMeasurement] = useState<Measurement>(emptyMeasurement)
  const [client, setClient] = useState<Client>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: 0,
      height: 0,
      body_fat_pct: 0,
      body_fat: 0,
      muscle_mass_pct: 0,
      muscle_mass: 0,
      water_pct: 0,
      bmi: 0,
      visceral_fat: 0,
      chest: 0,
      waist: 0,
      hip: 0,
      leftthigh: 0,
      rightthigh: 0,
      leftarm: 0,
      rightarm: 0,
      leftcalf: 0,
      rightcalf: 0,
    },
  })

  useEffect(() => {
    const fetchMeasurement = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(
          `${apiUrl}/measurements/${measurement_id}`,
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        const measurement: Measurement = res.data.measurement
        setMeasurement(measurement)

        form.reset({
          weight: measurement.weight,
          height: measurement.height,
          body_fat_pct: measurement.body_fat_pct,
          body_fat: measurement.body_fat,
          muscle_mass_pct: measurement.muscle_mass_pct,
          muscle_mass: measurement.muscle_mass,
          water_pct: measurement.water_pct,
          bmi: measurement.bmi,
          visceral_fat: measurement.visceral_fat,
          chest: measurement.chest,
          waist: measurement.waist,
          hip: measurement.hip,
          leftthigh: measurement.leftthigh,
          rightthigh: measurement.rightthigh,
          leftarm: measurement.leftarm,
          rightarm: measurement.rightarm,
          leftcalf: measurement.leftcalf,
          rightcalf: measurement.rightcalf,
        })
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          setErrorMessage(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeasurement()
  }, [token, measurement_id, form])

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true)
        const resClient = await axios.get(
          `${apiUrl}/clients/${measurement.clients.id}`,
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        const client = resClient.data.client
        setClient(client)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [token, measurement])

  const cancelEdit = () => {
    navigate(`/avaliacao/${measurement_id}`)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const updatedMeasurementInfo = {
      ...values,
      client_id: measurement.clients.id,
      date: measurement.date,
    }

    try {
      const resUpdatedMeasurement = await axios.put(
        `${apiUrl}/measurements/${measurement_id}`,
        updatedMeasurementInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      if (resUpdatedMeasurement.status === 201) {
        navigate(`/avaliacao/${measurement_id}`)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.status)
        console.error(error.response?.data)
      } else {
        console.error('An unexpected error occurred.', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Tailwind classes in a variable
  const label_group = 'flex flex-col items-start justify-center gap-1'
  const label = 'text-sm font-semibold leading-none'

  if (isLoading) return <Loading />
  if (!measurement) navigate('/avaliacoes')

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <div className='flex flex-row justify-between w-full gap-2 items-cnter'>
          <ArrowLeft
            className='w-6 h-6'
            onClick={() => navigate('/avaliacoes')}
          />
          <h1 className='text-2xl font-semibold'>
            Avaliação{' '}
            {client && 'de ' + client.firstname + ' ' + client.lastname}
          </h1>
        </div>

        <div
          id='measurement-header'
          className='flex flex-row items-center justify-between w-full mt-10 mb-8'
        >
          <div className={cn(label_group, 'col-span-2')}>
            <p className={label}>Data da avaliação</p>
            <p>{format(measurement.date, 'yyyy/MM/dd')}</p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-2 gap-4 mb-14'
          >
            <section className='col-span-2 mb-4 font-semibold'>
              <p>Dados gerais</p>
            </section>

            <FormField
              control={form.control}
              name='weight'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage ? 'text-red-500' : ''}`}
                  >
                    Peso
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`w-full ${
                        errorMessage ? 'border-red-500' : ''
                      }`}
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
              name='height'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Altura
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='body_fat_pct'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Gorda (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='body_fat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Gorda (Kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='muscle_mass_pct'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Muscular (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='muscle_mass'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Massa Muscular (Kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='water_pct'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Água (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='bmi'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    IMC
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='visceral_fat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Gordura Visceral
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <section className='col-span-2 my-4 font-semibold'>
              <p>Perímetros</p>
            </section>

            <FormField
              control={form.control}
              name='chest'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Busto
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='waist'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Cintura
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='hip'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Anca
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='leftthigh'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Perna Esquerda
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='rightthigh'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Perna Direita
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='leftarm'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Braço Esquerdo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='rightarm'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Braço Direito
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='leftcalf'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Gémeo Esquerdo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
              name='rightcalf'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${errorMessage} ? 'text-red-500' : ''`}
                  >
                    Gémeo Direito
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className={`${errorMessage} : 'border-red-500' : ''`}
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
                  'flex items-center justify-center px-3',
                  isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                )}
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

export default MeasurementEdit
