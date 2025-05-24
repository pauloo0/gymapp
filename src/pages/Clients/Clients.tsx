import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client } from '@/utils/interfaces'
import { differenceInYears } from 'date-fns'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'

import axios from 'axios'
import React, { useState, useEffect } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'

const emptyClient: Client[] = [
  {
    id: '',
    firstname: '',
    lastname: '',
    gender: '',
    phone_number: '',
    join_date: '',
    birthday: '',
    goal: '',
    injuries: '',
    health_conditions: '',
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
      associatedClients: 0,
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
  },
]

function Clients() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const [clients, setClients] = useState<Client[]>(emptyClient)
  const [filteredClients, setFilteredClients] = useState<Client[]>(emptyClient)
  const [isLoading, setIsLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    name: '',
  })

  const filterClient = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset filtered clients array
    setFilteredClients(clients)

    const element = e.target.name

    const searchTerm = e.target.value
    setSearchFilters((prevFilters) => {
      return { ...prevFilters, [element]: searchTerm }
    })

    setFilteredClients((prevClients) => {
      if (searchTerm === '') {
        return clients
      }

      return prevClients.filter((client) => {
        return (client.firstname + ' ' + client.lastname)
          .toLowerCase()
          .includes(searchFilters.name.toLowerCase())
      })
    })
  }

  const apiUrl: string = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${apiUrl}/clients`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const clients = res.data.clients.sort(
          (clientA: Client, clientB: Client) => {
            // Active clients first
            if (clientA.active !== clientB.active) {
              return clientA.active ? -1 : 1
            }
            // Then sort alphabetically by firstname, then lastname
            const nameA = (
              clientA.firstname +
              ' ' +
              clientA.lastname
            ).toLowerCase()
            const nameB = (
              clientB.firstname +
              ' ' +
              clientB.lastname
            ).toLowerCase()
            return nameA.localeCompare(nameB)
          }
        )

        setClients(clients)
        setFilteredClients(clients)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }

      setIsLoading(false)
    }

    fetchClients()
  }, [token, apiUrl])

  const goToClientPage = (id: string) => {
    navigate(`/cliente/${id}`)
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <h1 className='mb-10 text-2xl'>Os meus clientes</h1>

        {/* FILTERS */}
        <div className='grid grid-cols-2 gap-4 px-4 py-3 mb-4 bg-gray-900 border border-gray-800 rounded-lg'>
          <div className='flex flex-col items-start justify-start col-span-2 gap-1.5'>
            <Label htmlFor='name'>Nome</Label>
            <Input
              id='name'
              name='name'
              className='h-8'
              placeholder='Nome do cliente'
              type='text'
              value={searchFilters.name}
              onChange={(e) => filterClient(e)}
            />
          </div>
          <Button size={'sm'} onClick={() => navigate('/clientes/novo')}>
            <Plus className='w-5 h-5 mr-1' /> Novo cliente
          </Button>
        </div>

        <section id='client-list'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead>Data Entrada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients ? (
                filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className='hover:bg-gray-900'
                    onClick={() => goToClientPage(client.id)}
                  >
                    <TableCell>
                      {client.firstname} {client.lastname}
                    </TableCell>
                    <TableCell>
                      {client.birthday
                        ? differenceInYears(new Date(), client.birthday)
                        : '0'}
                    </TableCell>
                    <TableCell>{client.goal}</TableCell>
                    <TableCell>
                      {new Date(client.join_date).toLocaleDateString('pt-PT')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <p>Sem clients</p>
              )}
            </TableBody>
          </Table>
        </section>
      </main>
    </>
  )
}

export default Clients
