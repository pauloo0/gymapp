import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client, Measurement } from '@/utils/interfaces'

import axios from 'axios'
import { useEffect, useState } from 'react'

import TrainerNavbar from '@/components/TrainerNavbar'
import ClientNavbar from '@/components/ClientNavbar'
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Plus } from 'lucide-react'

import { format } from 'date-fns'
import { useNavigate } from 'react-router'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Measurements() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const userRole = user.userRole

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<
    Measurement[]
  >([])

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')

  useEffect(() => {
    if (userRole === 'client') return

    const fetchClients = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/clients`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const clients: Client[] = res.data.clients
          .filter((client: Client) => client.active === true)
          .sort((clientA: Client, clientB: Client) => {
            const nameA =
              `${clientA.firstname} ${clientA.lastname}`.toLowerCase()
            const nameB =
              `${clientB.firstname} ${clientB.lastname}`.toLowerCase()

            return nameA.localeCompare(nameB)
          })
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
  }, [token, userRole])

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const res = await axios.get(`${apiUrl}/measurements/`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const sortedMeasurements: Measurement[] = res.data.measurements.sort(
          (measurementA: Measurement, measurementB: Measurement) => {
            const dateA = new Date(measurementA.date)
            const dateB = new Date(measurementB.date)

            return dateB.getTime() - dateA.getTime()
          }
        )

        setMeasurements(sortedMeasurements)
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
  }, [token, userRole])

  useEffect(() => {
    setFilteredMeasurements(measurements)
  }, [measurements])

  useEffect(() => {
    if (!selectedClientId || selectedClientId === '') return

    setFilteredMeasurements(measurements)

    setFilteredMeasurements((measurements) => {
      const filtered = measurements.filter(
        (measurement) => measurement.clients.id === selectedClientId
      )
      return filtered
    })
  }, [selectedClientId, measurements])

  if (isLoading) return <Loading />

  if (userRole === 'client') {
    return (
      <>
        <ClientNavbar />

        <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
          <h1 className='mb-10 text-2xl'>Avaliações Físicas</h1>

          <section>
            {filteredMeasurements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-center'>Dia</TableHead>
                    <TableHead className='text-center'>Mês</TableHead>
                    <TableHead className='text-center'>Ano</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeasurements.map((measurement) => (
                    <TableRow
                      key={measurement.id}
                      className='w-full hover:bg-gray-900'
                      onClick={() =>
                        navigate(
                          `/avaliacoes/antropometricos/${measurement.id}`
                        )
                      }
                    >
                      <TableCell className='text-center'>
                        {format(measurement.date, 'dd')}
                      </TableCell>
                      <TableCell className='text-center'>
                        {format(measurement.date, 'MM')}
                      </TableCell>
                      <TableCell className='text-center'>
                        {format(measurement.date, 'yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className='text-center'>Sem avaliações disponíveis.</p>
            )}
          </section>
        </main>
      </>
    )
  }

  if (userRole === 'trainer') {
    return (
      <>
        <TrainerNavbar />

        <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
          <div className='flex flex-row items-center justify-start w-full gap-2 mb-6'>
            <ArrowLeft
              className='w-6 h-6'
              onClick={() => navigate('/avaliacoes/antropometricos/')}
            />
            <h1 className='text-2xl font-semibold'>Dados Antropométricos</h1>
          </div>

          {/* FILTERS */}
          <div className='grid grid-cols-2 gap-4 px-4 py-3 mb-4 bg-gray-900 border border-gray-800 rounded-lg'>
            <div className='flex flex-col items-start justify-start col-span-2 gap-1.5'>
              <Label>Nome do cliente</Label>
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
            <Button
              type='button'
              variant='default'
              size='sm'
              onClick={() => navigate('/avaliacoes/antropometricos/novo')}
            >
              <Plus className='w-5 h-5 mr-1' /> Criar nova
            </Button>
          </div>

          <section
            id='client_measurements'
            className='overflow-y-auto max-h-[32rem]'
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeasurements.length > 0
                  ? filteredMeasurements.map((measurement: Measurement) => (
                      <TableRow
                        key={measurement.id}
                        className='hover:bg-gray-900'
                        onClick={() =>
                          navigate(
                            `/avaliacoes/antropometricos/${measurement.id}`
                          )
                        }
                      >
                        <TableCell>
                          {measurement.clients.firstname +
                            ' ' +
                            measurement.clients.lastname}
                        </TableCell>
                        <TableCell>
                          {format(measurement.date, 'yyyy/MM/dd')}
                        </TableCell>
                      </TableRow>
                    ))
                  : selectedClientId !== '' && (
                      <TableRow className='hover:bg-gray-900'>
                        <TableCell colSpan={2} className='text-center'>
                          Não encontrei avaliações deste cliente.
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </section>
        </main>
      </>
    )
  }
}

export default Measurements
