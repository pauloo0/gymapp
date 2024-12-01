import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Schedule } from '@/utils/interfaces'
import { useState, useEffect } from 'react'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

import axios from 'axios'
import { format } from 'date-fns'
import { useParams } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function SchedulePage() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { schedule_id } = useParams()

  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/schedule/${schedule_id}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        setSchedule(res.data.appointment[0])
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred.', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [token, schedule_id])

  const editSchedule = (schedule: Schedule) => {
    window.location.href = `/marcacao/${schedule.id}/editar`
  }

  if (isLoading) return <Loading />

  if (!schedule) {
    window.location.href = '/marcacoes'
  } else {
    return (
      <div className='flex flex-col items-start justify-center'>
        <Navbar />
        <div className='flex flex-row items-center w-full gap-2 justify-vetween'>
          <ArrowLeft
            className='w-6 h-6'
            onClick={() => {
              window.location.href = '/marcacoes'
            }}
          />
          <h1 className='text-2xl font-semibold'>
            Agendamento{' '}
            {schedule.clients.firstname + ' ' + schedule.clients.lastname}
          </h1>
        </div>
        <div
          id='schedule-header'
          className='flex flex-row items-center justify-end w-full mt-10 mb-12'
        >
          <Button
            size={'sm'}
            className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-900 hover:bg-amber-500'
            onClick={() => editSchedule(schedule)}
          >
            <Pencil className='w-4 h-4' /> Editar
          </Button>
        </div>

        <div
          id='schedule-info'
          className='flex flex-col items-start justify-center gap-2'
        >
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Nome:</h2>
            {schedule.clients.firstname + ' ' + schedule.clients.lastname}
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Dia:</h2>
            {format(schedule.date, 'yyyy/MM/dd')}
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Hora:</h2>
            {schedule.time}
          </div>
        </div>
      </div>
    )
  }
}

export default SchedulePage
