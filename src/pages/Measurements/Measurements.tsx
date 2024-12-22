import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client, Measurement } from '@/utils/interfaces'

import axios from 'axios'
import { useEffect, useState } from 'react'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

import { Link } from 'react-router-dom'
import { format } from 'date-fns'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Measurements() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [measurements, setMeasurements] = useState<Measurement[]>([])

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/clients`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const clients: Client[] = res.data.clients
        setClients(clients)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [token])

  useEffect(() => {
    if (selectedClientId === '') {
      return
    }

    const fetchMeasurements = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(
          `${apiUrl}/measurements/client/${selectedClientId}`,
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        const measurements = res.data.measurements
        setMeasurements(measurements)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeasurements()
  }, [token, selectedClientId])

  if (isLoading) return <Loading />

  return (
    <>
      <Navbar />
      <h1 className='mb-10 text-2xl'>Avaliações</h1>

      <div className='p-3 border rounded-lg'>
        <Label className='mb-8'>Nome do cliente</Label>
        <Select onValueChange={(value) => setSelectedClientId(value)}>
          <SelectTrigger>
            <SelectValue placeholder='Selecione o cliente' />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client: Client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.firstname} {client.lastname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex flex-row items-center justify-between my-4'>
        <Button
          type='button'
          variant='default'
          size='sm'
          onClick={() => (window.location.href = '/avaliacoes/novo')}
        >
          Criar nova
        </Button>
      </div>

      <section
        id='client_measurements'
        className='flex flex-col items-center justify-center gap-4 overflow-y-auto max-h-[32rem]'
      >
        {measurements.length > 0
          ? measurements.map((measurement: Measurement) => (
              <Link
                to={`/avaliacao/${measurement.id}`}
                key={measurement.id}
                className='flex items-center justify-between w-full p-3 border rounded-lg felx-row'
              >
                <h2>{format(measurement.date, 'yyyy/MM/dd')}</h2>
              </Link>
            ))
          : selectedClientId !== '' && (
              <p>Não encontrei avaliações deste cliente.</p>
            )}
      </section>
    </>
  )
}

export default Measurements
