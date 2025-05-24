import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Schedule } from '@/utils/interfaces'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'

import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { format, isToday, parseISO } from 'date-fns'

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
import { Button } from '@/components/ui/button'

import { CalendarDays, Plus, TableOfContents } from 'lucide-react'
import { getTextColorForBackground } from '@/utils/functions'
import { useNavigate } from 'react-router'

const emptySchedule: Schedule[] = [
  {
    id: '',
    date: '',
    time: '',
    status: 'scheduled',
    clients: {
      id: '',
      firstname: '',
      lastname: '',
      client_locations: {
        id: '',
        location: '',
        color_hex: '',
      },
      subscriptions: {
        id: '',
        packages: {
          id: '',
          name: '',
          days_per_month: 0,
          duration: 0,
        },
      },
    },
    workouts: null,
  },
]

const HOUR_START = 7
const HOUR_END = 23
const HOUR_HEIGHT_REM = 4
const hours = Array.from(
  { length: HOUR_END + 1 - HOUR_START },
  (_, i) => HOUR_START + i
)

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Schedules() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const [schedules, setSchedules] = useState<Schedule[]>(emptySchedule)
  const [filteredSchedules, setFilteredSchedules] =
    useState<Schedule[]>(emptySchedule)
  const [isLoading, setIsLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    view: 'calendar',
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

  const handleViewChange = (view: string) => {
    setSearchFilters((prev) => ({ ...prev, view: view }))
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
        handleViewChange('calendar')
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

  useEffect(() => {
    if (searchFilters.view === 'calendar') {
      const filtered = schedules.filter(
        (schedule: Schedule) =>
          isToday(parseISO(schedule.date)) && schedule.status !== 'canceled'
      )
      setFilteredSchedules(filtered)
    } else {
      setFilteredSchedules(schedules)
    }
  }, [searchFilters.view, schedules])

  if (isLoading) return <Loading />

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <h1 className='mb-10 text-2xl'>Agendamentos</h1>

        <div
          id='buttons'
          className='flex flex-col items-center justify-between gap-3 mb-4 sm:flex-row'
        >
          <Button size={'sm'} onClick={() => navigate('/marcacao/novo')}>
            <Plus className='w-5 h-5 mr-1' /> Nova marcação
          </Button>

          <div className='flex items-center gap-2'>
            <Button
              size={'sm'}
              variant={
                searchFilters.view === 'calendar' ? 'default' : 'outline'
              }
              onClick={() => handleViewChange('calendar')}
            >
              <CalendarDays className='w-5 h-5' />
            </Button>
            <Button
              size={'sm'}
              variant={searchFilters.view === 'table' ? 'default' : 'outline'}
              onClick={() => handleViewChange('table')}
            >
              <TableOfContents className='w-5 h-5' />
            </Button>
          </div>
        </div>

        {searchFilters.view === 'calendar' ? (
          <>
            <div className='flex flex-col p-4 border border-gray-800 rounded-lg'>
              <h2 className='mb-6 text-lg font-semibold'>Hoje</h2>
              <div className='flex w-full'>
                {/* Hour labels */}
                <div className='flex flex-col items-center pr-4'>
                  {hours.map((hour) => (
                    <div key={hour} className='h-16 text-sm text-gray-600'>
                      {hour.toString().padStart(2, '0') + ':00'}
                    </div>
                  ))}
                </div>
                {/* Calendar Pane */}
                <div className='relative flex-1 border-gray-300 border-1'>
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className='absolute left-0 right-0 border-t border-gray-600'
                      style={{
                        top: `${(hour - HOUR_START) * HOUR_HEIGHT_REM}rem`,
                      }}
                    />
                  ))}
                  {/* Schedules */}
                  {filteredSchedules.map((schedule) => {
                    const [hh, mm] = schedule.time.split(':').map(Number)
                    const startOffset =
                      (hh + mm / 60 - HOUR_START) * HOUR_HEIGHT_REM
                    const height = schedule.clients.subscriptions.packages
                      ? schedule.clients.subscriptions.packages.duration
                      : 1 * HOUR_HEIGHT_REM
                    const colorHex = `#${schedule.clients.client_locations.color_hex}`
                    const textColorClass = getTextColorForBackground(colorHex)
                    return (
                      <div
                        key={`${schedule.clients.id}-${schedule.time}`}
                        className={`absolute p-1 px-2 overflow-hidden text-sm rounded-lg left-2 right-2 hover:cursor-pointer ${textColorClass}`}
                        style={{
                          top: `${startOffset}rem`,
                          height: `${height}rem`,
                          backgroundColor: colorHex,
                        }}
                        onClick={() => navigate(`/marcacao/${schedule.id}`)}
                      >
                        <div className='font-medium truncate'>
                          {schedule.clients.firstname}{' '}
                          {schedule.clients.lastname}
                        </div>
                        <div className='text-xs'>
                          {schedule.time} -{' '}
                          {(() => {
                            const endHour =
                              hh +
                              (schedule.clients.subscriptions.packages
                                ? schedule.clients.subscriptions.packages
                                    .duration
                                : 1)
                            const endMin = mm
                            return `${endHour
                              .toString()
                              .padStart(2, '0')}:${endMin
                              .toString()
                              .padStart(2, '0')}`
                          })()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
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
                  onChange={(e) => filterSchedule(e)}
                />
              </div>
            </div>

            <section id='schedule-list'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules ? (
                    filteredSchedules.map((schedule: Schedule) => (
                      <TableRow
                        key={schedule.id}
                        className='hover:bg-gray-900'
                        onClick={() => navigate(`/marcacao/${schedule.id}`)}
                      >
                        <TableCell>
                          {schedule.clients.firstname +
                            ' ' +
                            schedule.clients.lastname}
                        </TableCell>
                        <TableCell
                          className={`border-l-8 pl-2`}
                          style={{
                            borderColor:
                              '#' + schedule.clients.client_locations.color_hex,
                          }}
                        >
                          {schedule.clients.client_locations.location}
                        </TableCell>
                        <TableCell>
                          {format(schedule.date, 'yyyy/MM/dd')}
                        </TableCell>
                        <TableCell>{schedule.time}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <p>Nenhum agendamento criado.</p>
                  )}
                </TableBody>
              </Table>
            </section>
          </>
        )}
      </main>
    </>
  )
}

export default Schedules
