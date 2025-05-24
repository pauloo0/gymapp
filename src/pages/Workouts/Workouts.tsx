import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client, Workout } from '@/utils/interfaces'

import axios from 'axios'
import { useEffect, useState } from 'react'

import { Ellipsis, Files, Pencil, Plus } from 'lucide-react'

import TrainerNavbar from '@/components/TrainerNavbar'
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

import { Link, useNavigate } from 'react-router-dom'
import ClientNavbar from '@/components/ClientNavbar'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Workouts() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const userRole = user.userRole

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    if (userRole === 'client') return

    const fetchClients = async () => {
      try {
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
      }

      setIsLoading(false)
    }

    fetchClients()
  }, [token, userRole])

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/workouts/`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const workouts: Workout[] = res.data.workouts

        if (userRole === 'client') {
          const filteredPublicWorkouts = workouts.filter(
            (workout) => workout.public
          )
          setWorkouts(filteredPublicWorkouts)
        } else {
          setWorkouts(workouts)
        }
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

    fetchWorkouts()
  }, [token, userRole])

  useEffect(() => {
    setFilteredWorkouts(workouts)
  }, [workouts])

  useEffect(() => {
    setFilteredWorkouts(workouts)

    if (selectedClientId !== '') {
      setFilteredWorkouts((workouts) => {
        const filtered = workouts.filter(
          (workout) => workout.clients.id === selectedClientId
        )

        return filtered
      })
    }

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
  }, [filter, selectedClientId, workouts])

  if (isLoading) return <Loading />

  if (userRole === 'client') {
    return (
      <>
        {userRole === 'client' ? <ClientNavbar /> : <TrainerNavbar />}

        <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
          <h1 className='mb-10 text-2xl'>Planos de treino</h1>

          <section
            id='client_workouts'
            className='flex flex-col items-center gap-4 jusftify-center overflow-y-auto max-h-[32rem]'
          >
            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout: Workout) => (
                <Link
                  to={`/treino/${workout.id}`}
                  key={workout.id}
                  className='flex flex-row items-center justify-between w-full px-3 py-4 border border-gray-800 rounded-lg hover:bg-gray-900'
                >
                  <div className='flex flex-col items-start justify-center gap-2'>
                    <h2 className='text-xl'>{workout.name}</h2>
                  </div>
                </Link>
              ))
            ) : (
              <p>Ainda não tem planos de treino criados.</p>
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
          <h1 className='mb-10 text-2xl'>Planos de treino</h1>

          {/* FILTERS */}
          <div className='grid grid-cols-2 gap-2 px-4 py-3 mb-4 bg-gray-900 border border-gray-800 rounded-lg'>
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

            <div className='flex flex-col-reverse items-center justify-between col-span-2 gap-4 sm:flex-row sm:gap-12'>
              <Button
                type='button'
                variant='default'
                size='sm'
                onClick={() => navigate('/treinos/novo')}
                className='w-full'
              >
                <Plus className='w-5 h-5 mr-1' /> Criar novo
              </Button>

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
                  className='flex flex-row items-center justify-between w-full px-3 py-4 border border-gray-800 rounded-lg hover:bg-gray-900'
                >
                  <div className='flex flex-col items-start justify-center gap-2'>
                    <h2 className='text-xl'>{workout.name}</h2>
                    <p className='text-sm text-gray-500'>
                      Cliente:
                      {' ' +
                        workout.clients.firstname +
                        ' ' +
                        workout.clients.lastname}
                    </p>
                  </div>
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
        </main>
      </>
    )
  }
}

export default Workouts
