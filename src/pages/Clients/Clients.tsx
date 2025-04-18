import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client } from '@/utils/interfaces'
import { getAge } from '@/utils/functions'

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
    trainer_id: '',
    active: false,
    users: {
      id: '',
      email: '',
    },
    subscriptions: [
      {
        id: '',
        start_date: '',
        active: false,
        packages: {
          id: '',
          name: '',
          days_per_week: 0,
          price: 0,
          active: false,
        },
      },
    ],
  },
]

function Clients() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
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
            const active = clientA.active ? 1 : 0
            const active2 = clientB.active ? 1 : 0
            return active - active2
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
    window.location.href = `/cliente/${id}`
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)]'>
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
          <Button
            size={'sm'}
            onClick={() => (window.location.href = '/clientes/novo')}
          >
            <Plus className='w-5 h-5 mr-1' /> Novo cliente
          </Button>
        </div>

        <section id='client-list' className='overflow-y-auto max-h-[32rem]'>
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
                      {client.birthday ? getAge(client.birthday) : '0'}
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
