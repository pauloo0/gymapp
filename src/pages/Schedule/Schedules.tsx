import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Schedule } from '@/utils/interfaces'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'

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
import { ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const emptySchedule: Schedule[] = [
  {
    id: '',
    date: '',
    time: '',
    clients: { id: '', firstname: '', lastname: '' },
  },
]

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Schedules() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [schedules, setSchedules] = useState<Schedule[]>(emptySchedule)
  const [filteredSchedules, setFilteredSchedules] =
    useState<Schedule[]>(emptySchedule)
  const [isLoading, setIsLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    name: '',
  })

  const filterSchedule = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilteredSchedules(schedules)

    const element = e.target.name
    const searchTerm = e.target.value

    setSearchFilters((prevFilters) => {
      return { ...prevFilters, [element]: searchTerm }
    })

    setFilteredSchedules((prevSchedules) => {
      if (searchTerm === '') {
        return schedules
      }

      return prevSchedules.filter((schedule) => {
        return (schedule.clients.firstname + ' ' + schedule.clients.lastname)
          .toLowerCase()
          .includes(searchFilters.name.toLowerCase())
      })
    })
  }

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`${apiUrl}/schedule`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const sortedSchedules = res.data.schedule.sort(
          (a: Schedule, b: Schedule) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            const timeA = new Date(`1970-01-01T${a.time}`)
            const timeB = new Date(`1970-01-01T${b.time}`)
            return (
              dateB.getTime() - dateA.getTime() ||
              timeB.getTime() - timeA.getTime()
            )
          }
        )

        setSchedules(sortedSchedules)
        setFilteredSchedules(sortedSchedules)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }

      setIsLoading(false)
    }

    fetchSchedules()
  }, [token])

  if (isLoading) return <Loading />

  return (
    <>
      <Navbar />
      <h1 className='mb-10 text-2xl'>Agendamentos</h1>

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
            onChange={(e) => filterSchedule(e)}
          />
        </div>
        <Button
          size={'sm'}
          onClick={() => (window.location.href = '/marcacao/novo')}
        >
          <Plus className='w-5 h-5 mr-1' /> Nova marcação
        </Button>
      </div>

      <section id='schedule-list' className='overflow-y-auto max-h-[32rem]'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules ? (
              filteredSchedules.map((schedule: Schedule) => (
                <TableRow
                  key={schedule.id}
                  className={`${
                    new Date() > new Date(schedule.date)
                      ? 'bg-red-50 hover:bg-red-100 opacity-80'
                      : ''
                  }`}
                >
                  <TableCell>
                    {schedule.clients.firstname +
                      ' ' +
                      schedule.clients.lastname}
                  </TableCell>
                  <TableCell>{format(schedule.date, 'yyyy/MM/dd')}</TableCell>
                  <TableCell>{schedule.time}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() =>
                        (window.location.href = `/marcacao/${schedule.id}`)
                      }
                      variant={'link'}
                    >
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <p>Nenhum agendamento criado.</p>
            )}
          </TableBody>
        </Table>
      </section>
    </>
  )
}

export default Schedules
