import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client, Workout } from '@/utils/interfaces'

import axios from 'axios'
import { useEffect, useState } from 'react'

import { Ellipsis, Files, Pencil, Plus } from 'lucide-react'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { Link } from 'react-router-dom'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Workouts() {
  const token = useToken()
  const user = useUser()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [filter, setFilter] = useState<string>('')

  if (!token || !user) {
    window.location.href = '/login'
  }

  useEffect(() => {
    const fetchClients = async () => {
      try {
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
      }

      setIsLoading(false)
    }

    fetchClients()
  }, [token])

  useEffect(() => {
    if (selectedClientId === '') {
      return
    }

    const fetchWorkouts = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/workouts/client/${selectedClientId}`,
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        setWorkouts(res.data.workouts)
        setFilteredWorkouts(res.data.workouts)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    fetchWorkouts()
  }, [token, selectedClientId])

  useEffect(() => {
    setFilteredWorkouts(workouts)

    setFilteredWorkouts((workouts) => {
      const filteredWorkouts = workouts.filter((workout) => {
        switch (filter) {
          case 'active':
            return workout.active
          case 'inactive':
            return !workout.active
          case 'public':
            return workout.public
          case 'private':
            return !workout.public
          default:
            return true
        }
      })

      return filteredWorkouts
    })
  }, [filter, workouts])

  if (isLoading) return <Loading />

  return (
    <>
      <Navbar />
      <h1 className='mb-10 text-2xl'>Planos de treino</h1>

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

      <div
        id='filters_and_buttons'
        className='flex flex-row items-center justify-between my-4'
      >
        <Button
          type='button'
          variant='default'
          size='sm'
          onClick={() => (window.location.href = '/treinos/novo')}
        >
          <Plus className='w-5 h-5 mr-1' /> Criar novo
        </Button>

        <div id='filters'>
          <Select onValueChange={(value) => setFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder='Ver ...' defaultValue={'all'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Ver todos</SelectItem>
              <SelectItem value='active'>Ver apenas ativos</SelectItem>
              <SelectItem value='inactive'>Ver apenas inativos</SelectItem>
              <SelectItem value='public'>Ver apenas públicos</SelectItem>
              <SelectItem value='private'>Ver apenas privados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section
        id='client_workouts'
        className='flex flex-col items-center gap-4 jusftify-center overflow-y-auto max-h-[32rem]'
      >
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout: Workout) => (
            <Link
              to={`/treino/${workout.id}`}
              key={workout.id}
              className='flex flex-row items-center justify-between w-full p-3 border rounded-lg'
            >
              <h2>{workout.name}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Ellipsis className='w-4 h-4' />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link
                      to={'/treinos/novo'}
                      className='flex flex-row items-center justify-start gap-1'
                    >
                      <Files className='w-4 h-4' />
                      Duplicar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      to={`/treino/${workout.id}/editar`}
                      className='flex flex-row items-center justify-start gap-1'
                    >
                      <Pencil className='w-4 h-4' />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Link>
          ))
        ) : (
          <p>Não encontrei planos de treino para este cliente.</p>
        )}
      </section>
    </>
  )
}

export default Workouts
