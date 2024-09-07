import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import Navbar from '@/components/Navbar'

import axios from 'axios'
import { useEffect, useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Client {
  id: string
  firstname: string
  lastname: string
  join_date: string
  birthday: string
  goal: string
  trainer_id: string
  active: boolean
  users: {
    id: string
    email: string
  }
}

const emptyClient: Client[] = [
  {
    id: '',
    firstname: '',
    lastname: '',
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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/clients', {
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
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    fetchClients()
  }, [token])

  const getAge = (birthday: string) => {
    return new Date().getFullYear() - new Date(birthday).getFullYear()
  }

  const goToClientPage = (id: string) => {
    window.location.href = `/cliente/${id}`
  }

  // TODO Add filters and sorting to the table

  return (
    <>
      <Navbar />
      <h1 className='mb-10 text-2xl'>Os meus clientes</h1>

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
          {clients ? (
            clients.map((client) => (
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
