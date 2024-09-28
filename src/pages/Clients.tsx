import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client } from '@/utils/interfaces'
import { getAge } from '@/utils/functions'

import Navbar from '@/components/Navbar'
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
      <Navbar />
      <h1 className='mb-10 text-2xl'>Os meus clientes</h1>

      {/* FILTERS */}
      <div className='grid grid-cols-2 gap-4 px-4 py-3 mb-4 border rounded-lg'>
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
      </div>

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
                onClick={() => goToClientPage(client.id)}
              >
                <TableCell>
                  {client.firstname} {client.lastname}
                </TableCell>
                <TableCell className='text-center'>
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
    </>
  )
}

export default Clients
