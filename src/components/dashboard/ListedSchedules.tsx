import { useToken } from '@/utils/tokenWrapper'
import { Schedule } from '@/utils/interfaces'
import axios from 'axios'
import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const emptySchedules: Schedule[] = [
  {
    id: '',
    date: '',
    time: '',
    clients: {
      id: '',
      firstname: '',
      lastname: '',
    },
  },
]

function ListedSchedules() {
  const token = useToken()

  const [schedules, setSchedules] = useState<Schedule[]>(emptySchedules)

  const apiUrl: string = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`${apiUrl}/schedule`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const today = new Date()
        const currentTime = today.getHours() + ':' + today.getMinutes()

        const sortedSchedules = res.data.schedule
          .filter(
            (schedule: Schedule) =>
              schedule.date ===
                new Date(new Date().setHours(1, 0, 0, 0)).toISOString() &&
              schedule.time >= currentTime
          )
          .sort((scheduleA: Schedule, scheduleB: Schedule) => {
            const dateA = new Date(scheduleA.date)
            const dateB = new Date(scheduleB.date)
            const timeA = new Date(`1970-01-01T${scheduleA.time}`)
            const timeB = new Date(`1970-01-01T${scheduleB.time}`)
            return (
              dateA.getTime() - dateB.getTime() ||
              timeA.getTime() - timeB.getTime()
            )
          })

        setSchedules(sortedSchedules)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error.response?.status)
          console.log(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    fetchSchedules()
  }, [token, apiUrl])

  const navigateToSchedule = (id: string) => {
    window.location.href = `/marcacao/${id}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-2 p-2'>
        {schedules.length === 0 ? (
          <div className='flex flex-col justify-center gap-2'>
            <p className='text-center'>Sem marcações</p>
            <Button onClick={() => navigateToSchedule('novo')}>
              Fazer marcação
            </Button>
          </div>
        ) : (
          schedules.map((schedule: Schedule) => (
            <div
              className='flex flex-row items-center justify-between px-4 py-2 border rounded-xl hover:cursor-pointer hover:bg-slate-100'
              key={schedule.id}
              onClick={() => navigateToSchedule(schedule.id)}
            >
              <div>
                {schedule.clients.firstname + ' ' + schedule.clients.lastname}
              </div>
              <div className='flex flex-col items-end justify-center text-sm text-slate-500'>
                <span>{schedule.time}</span>
                <span>
                  {new Date(schedule.date).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default ListedSchedules
