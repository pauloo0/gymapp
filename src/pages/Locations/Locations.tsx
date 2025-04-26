import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { ClientLocation } from '@/utils/interfaces'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'

import axios from 'axios'
import { useState, useEffect } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

export default function ClientLocations() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [clientLocations, setClientLocations] = useState<ClientLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClientLocations = async () => {
      try {
        const res = await axios.get(`${apiUrl}/client-locations`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const locations = res.data.locations
        setClientLocations(locations)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientLocations()
  }, [token])

  const deleteLocation = async (id: string) => {
    console.log(id)
  }

  const redirectNewLocation = () => {
    window.location.href = '/localizacoes/nova'
  }

  if (isLoading) return <Loading />

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <section className='flex flex-col gap-6 mb-10'>
          <h1 className='text-2xl '>Localizações dos clientes</h1>
          <Button type='button' onClick={redirectNewLocation}>
            <Plus className='w-4 h-4 mr-1' /> Criar localização
          </Button>
        </section>

        <section
          id='location-list'
          className='flex flex-col items-center justify-center gap-4'
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Localiização</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientLocations.length > 0 ? (
                clientLocations.map((location: ClientLocation) => (
                  <TableRow key={location.id} className='hover:bg-gray-900'>
                    <TableCell>{location.location}</TableCell>
                    <TableCell>
                      <div
                        className='w-8 h-6 rounded-lg'
                        style={{ backgroundColor: '#' + location.color_hex }}
                      />
                    </TableCell>
                    <TableCell className='flex flex-row items-center justify-end gap-3'>
                      <Link
                        to={`/localizacoes/${location.id}/edit`}
                        className='p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900'
                      >
                        <Pencil className='w-4 h-4' />
                      </Link>
                      {location.associatedClients === 0 && (
                        <div
                          onClick={() => deleteLocation(location.id)}
                          className='p-2 bg-red-500 rounded-lg hover:bg-red-600 hover:cursor-pointer'
                        >
                          <Trash2 className='w-4 h-4' />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className='hover:bg-gray-900'>
                  <TableCell colSpan={3} className='text-center'>
                    Ainda não tem localizações criadas.
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
