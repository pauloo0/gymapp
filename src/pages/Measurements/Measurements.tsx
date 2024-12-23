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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    let endpointUrl = `${apiUrl}/measurements/`
    if (selectedClientId !== '') {
      endpointUrl += `client/${selectedClientId}/`
    }

    const fetchMeasurements = async () => {
      try {
        const res = await axios.get(endpointUrl, {
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
        // setFilteredMeasurements(sortedMeasurements)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurements.length > 0
              ? measurements.map((measurement: Measurement) => (
                  <TableRow
                    key={measurement.id}
                    onClick={() =>
                      (window.location.href = `/avaliacao/${measurement.id}`)
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
                  <TableRow>
                    <TableCell colSpan={2} className='text-center'>
                      Não encontrei avaliações deste cliente.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </section>
    </>
  )
}

export default Measurements
