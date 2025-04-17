import { useState, useEffect } from 'react'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import { Schedule } from '@/utils/interfaces'
import axios from 'axios'
import { isThisWeek } from 'date-fns'

import Loading from '@/components/reusable/Loading'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function ClientDashboard() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [isLoading, setIsLoading] = useState(true)
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resSchedules] = await Promise.all([
          axios.get(`${apiUrl}/schedule`, {
            headers: {
              'Auth-Token': token,
            },
          }),
        ])

        const schedules: Schedule[] = resSchedules.data.schedule

        const sortedSchedules = schedules
          .filter((schedule: Schedule) => isThisWeek(schedule.date))
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
          console.error(error.response?.data)
          console.error(error.response?.status)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  const navigateToSchedule = (id: string) => {
    window.location.href = `/marcacao/${id}`
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className='flex flex-col gap-4 min-h-[calc(100vh_-_64px)]'>
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-2 p-2'>
          {schedules.length === 0 ? (
            <div className='flex flex-col justify-center gap-2'>
              <p className='text-center'>Sem marcações</p>
            </div>
          ) : (
            schedules.map((schedule: Schedule) => (
              <div
                className='flex flex-row items-center justify-between px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl hover:cursor-pointer hover:bg-gray-900 text-gray-50'
                key={schedule.id}
                onClick={() => navigateToSchedule(schedule.id)}
              >
                <div>
                  {schedule.clients.firstname + ' ' + schedule.clients.lastname}
                </div>
                <div className='flex flex-col items-end justify-center text-sm text-gray-300'>
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
    </div>
  )
}

export default ClientDashboard
