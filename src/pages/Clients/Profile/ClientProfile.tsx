import { useParams } from 'react-router'
import axios from 'axios'
import { useState, useEffect } from 'react'

import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import {
  Client,
  Measurement,
  Schedule,
  Workout,
  Invoice,
  Subscription,
} from '@/utils/interfaces'
import { getAge } from '@/utils/functions'

import TrainerNavbar from '@/components/TrainerNavbar'

import { ArrowLeft, Pencil } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  Avatar,
  AvatarFallback,
  //AvatarImage
} from '@/components/ui/avatar'

import ClientMeasurements from './ClientMeasurements'
import ClientWorkouts from './ClientWorkouts'
import ClientSchedules from './ClientSchedules'
import ClientInvoices from './ClientInvoices'

import Loading from '@/components/reusable/Loading'
import { Button } from '@/components/ui/button'

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
  client_locations: {
    id: '',
    trainer_id: '',
    location: '',
    color_hex: '',
  },
  subscriptions: [
    {
      id: '',
      start_date: '',
      active: false,
      packages: {
        id: '',
        name: '',
        price: 0,
        duration: 0,
        days_per_month: 0,
        active: false,
      },
    },
  ],
}

const emptyMeasurement: Measurement[] = [
  {
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
  },
]

const emptyInvoice: Invoice[] = [
  {
    id: '',
    issue_date: '',
    due_date: '',
    amount: 0,
    status: '',
    subscriptions: {
      id: '',
      start_date: '',
      active: false,
      package_id: '',
      clients: {
        id: '',
        firstname: '',
        lastname: '',
        active: false,
      },
    },
  },
]

const emptySchedule: Schedule[] = [
  {
    id: '',
    date: '',
    time: '',
    clients: {
      id: '',
      firstname: '',
      lastname: '',
    },
    workouts: null,
  },
]

const emptySubscription: Subscription = {
  id: '',
  start_date: '',
  active: false,
  packages: {
    id: '',
    name: '',
    price: 0,
    duration: 0,
    days_per_month: 0,
    active: false,
  },
}

function ClientProfile() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { id } = useParams()

  const [isLoading, setIsLoading] = useState(true)

  const [client, setClient] = useState(emptyClient)
  const [measurements, setMeasurements] = useState(emptyMeasurement)
  const [invoices, setInvoices] = useState(emptyInvoice)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [subscription, setSubscription] = useState(emptySubscription)
  const [schedules, setSchedules] = useState(emptySchedule)

  const apiUrl: string = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const [res1, res2, res3, res4, res5, res6] = await Promise.all([
          axios.get(`${apiUrl}/clients/${id}`, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get(`${apiUrl}/measurements/client/${id}`, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get(`${apiUrl}/invoices/client/${id}`, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get(`${apiUrl}/workouts/client/${id}`, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get(`${apiUrl}/subscriptions/client/${id}/active`, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get(`${apiUrl}/schedule/client/${id}`, {
            headers: {
              'Auth-Token': token,
            },
          }),
        ])

        const client = res1.status === 204 ? emptyClient : res1.data.client
        const measurements =
          res2.status === 204 ? emptyMeasurement : res2.data.measurements
        const invoices = res3.status === 204 ? emptyInvoice : res3.data.invoices
        const workouts = res4.status === 204 ? [] : res4.data.workouts
        const subscription =
          res5.status === 204 ? emptySubscription : res5.data.subscription
        const schedules =
          res6.status === 204 ? emptySchedule : res6.data.schedule

        setClient(client)
        setMeasurements(measurements)
        setInvoices(invoices)
        setWorkouts(workouts)
        setSubscription(subscription)
        setSchedules(schedules)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
          console.error(error.response?.status)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
      setIsLoading(false)
    }

    fetchClientInfo()
  }, [token, id, apiUrl])

  // Tailwind classes in a variable
  const label_group = 'flex flex-col items-start justify-center gap-1'
  const label = 'text-sm font-semibold leading-none'

  const editClient = (client: Client) => {
    window.location.href = `/cliente/${client.id}/editar`
  }

  // Return to client list if client is not found
  if (!isLoading && client.id === '') {
    window.location.href = '/clientes'
  }

  if (isLoading) {
    return <Loading />
  }

  console.log(client)

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <ArrowLeft
          className='w-6 h-6'
          onClick={() => (window.location.href = '/clientes')}
        />
        <div
          id='client-header'
          className='flex flex-row items-center justify-between w-full mt-10 mb-12'
        >
          <Avatar className='w-14 h-14'>
            {/* TODO Add image to avatar */}
            {/* <AvatarImage src={client.image} /> */}
            <AvatarFallback>
              {client.firstname[0] + client.lastname[0]}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col w-full ml-4'>
            <h1 className='text-xl'>
              {client.firstname} {client.lastname}
            </h1>
          </div>

          <Button
            size={'sm'}
            className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-800 hover:bg-amber-500'
            onClick={() => editClient(client)}
          >
            <Pencil className='w-4 h-4' />
            Editar
          </Button>
        </div>

        <section id='client-info' className='w-full overflow-y-auto'>
          <Accordion
            id='client-sections'
            type='single'
            collapsible
            className='w-full'
            defaultValue='profile'
          >
            <AccordionItem value='profile'>
              <AccordionTrigger className='p-4 text-lg font-semibold hover:no-underline'>
                Informação
              </AccordionTrigger>
              <AccordionContent className='px-4'>
                <div className='grid grid-cols-2 gap-x-16 gap-y-4'>
                  <div className={label_group}>
                    <p className={label}>Data de nascimento</p>
                    <p>
                      {new Date(client.birthday).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Idade</p>
                    <p>{getAge(client.birthday)}</p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Género</p>
                    <p>{client.gender}</p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Telemóvel</p>
                    <p>{client.phone_number}</p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Email</p>
                    <p>{client.users.email}</p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Data Entrada</p>
                    <p>
                      {new Date(client.join_date).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Pacote Subscrito</p>
                    <p>
                      {subscription.id === ''
                        ? 'Sem subscrição ativa'
                        : subscription.packages.name}
                    </p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Ativo ?</p>
                    <p>{client.active ? 'Sim' : 'Não'}</p>
                  </div>
                  <div className={label_group}>
                    <p className={label}>Localização</p>
                    <p
                      className={`border-l-8 pl-2`}
                      style={{
                        borderColor: '#' + client.client_locations.color_hex,
                      }}
                    >
                      {client.client_locations.location}
                    </p>
                  </div>
                  <div className={`${label_group} col-span-2`}>
                    <p className={label}>Objetivo</p>
                    <p>{client.goal}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='measurements'>
              <AccordionTrigger className='p-4 text-lg font-semibold hover:no-underline'>
                Medições
              </AccordionTrigger>
              <AccordionContent className='px-4'>
                <ClientMeasurements measurements={measurements} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='workouts'>
              <AccordionTrigger className='p-4 text-lg font-semibold hover:no-underline'>
                Planos
              </AccordionTrigger>
              <AccordionContent className='px-4'>
                <ClientWorkouts workouts={workouts} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='schedule'>
              <AccordionTrigger className='p-4 text-lg font-semibold hover:no-underline'>
                Marcações
              </AccordionTrigger>
              <AccordionContent className='px-4'>
                <ClientSchedules schedules={schedules} client_id={client.id} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='invoicing'>
              <AccordionTrigger className='p-4 text-lg font-semibold hover:no-underline'>
                Faturação
              </AccordionTrigger>
              <AccordionContent className='px-4'>
                <ClientInvoices invoices={invoices} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
    </>
  )
}

export default ClientProfile
