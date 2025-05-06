import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Schedule } from '@/utils/interfaces'
import { useState, useEffect } from 'react'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'

import axios from 'axios'
import { format, isBefore } from 'date-fns'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function SchedulePage() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const { schedule_id } = useParams()

  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isScheduleInPast, setIsScheduleInPast] = useState<boolean>(false)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/schedule/${schedule_id}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const schedule: Schedule = res.data.appointment[0]

        setSchedule(schedule)

        const scheduleDate = new Date(schedule.date)
        const scheduleTime = schedule.time
        const [hours, minutes] = scheduleTime.split(':').map(Number)
        scheduleDate.setHours(hours, minutes, 0, 0)

        setIsScheduleInPast(isBefore(scheduleDate, new Date()))
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
    navigate(`/marcacao/${schedule.id}/editar`)
  }

  const deleteSchedule = async (sch: Schedule) => {
    if (isScheduleInPast) {
      alert('Esta marcação é no passado.')
    } else {
      setIsLoading(true)

      try {
        const res = await axios.delete(`${apiUrl}/schedule/${sch.id}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        if (res.status === 200) navigate('/marcacoes')
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isLoading) return <Loading />

  if (!schedule) {
    navigate('/marcacoes')
  } else {
    return (
      <>
        <TrainerNavbar />

        <main className='min-h-[calc(100vh_-_64px)]'>
          <div className='flex flex-row items-center justify-between w-full gap-2'>
            <ArrowLeft
              className='w-6 h-6'
              onClick={() => {
                navigate('/marcacoes')
              }}
            />
            <h1 className='text-2xl font-semibold'>
              Agendamento{' '}
              {schedule.clients.firstname + ' ' + schedule.clients.lastname}
            </h1>
          </div>
          <div
            id='schedule-header'
            className='flex flex-row items-center justify-end w-full gap-2 mt-10 mb-12'
          >
            <Button
              size={'sm'}
              className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-900 hover:bg-amber-500'
              onClick={() => editSchedule(schedule)}
            >
              <Pencil className='w-4 h-4' /> Editar
            </Button>
            {!isScheduleInPast && (
              <Button
                size={'sm'}
                className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-red-700 border-red-600 text-gray-50 hover:bg-red-800'
                onClick={() => deleteSchedule(schedule)}
              >
                <Trash2 className='w-4 h-4' /> Apagar
              </Button>
            )}
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

            {schedule.workouts && (
              <section className='flex flex-col gap-2 mt-4'>
                <div
                  id='workout-link'
                  className='flex flex-col items-start justify-between'
                >
                  <h2 className='text-lg font-semibold'>Treino associado:</h2>
                  <Link to={`/treino/${schedule.workouts.id}`}>
                    <p className='flex flex-row items-center justify-center text-xl'>
                      {schedule.workouts.name}{' '}
                      <ArrowRight className='w-5 h-5 ml-2' />
                    </p>
                  </Link>
                </div>
              </section>
            )}
          </div>
        </main>
      </>
    )
  }
}

export default SchedulePage
