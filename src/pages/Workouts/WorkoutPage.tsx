import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { Workout } from '@/utils/interfaces'

import { ArrowLeft, Pencil } from 'lucide-react'
import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'
import { Button } from '@/components/ui/button'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const emptyWorkout: Workout = {
  id: '',
  name: '',
  active: false,
  public: false,
  workout_exercises: [
    {
      exercises: {
        id: '',
        name: '',
        description: '',
        equipment: {
          id: '',
          name: '',
        },
        bodyparts: {
          id: '',
          name: '',
        },
        media: [
          {
            id: '',
            type: '',
            url: '',
          },
        ],
      },
      reps: 0,
      sets: 0,
    },
  ],
  clients: {
    id: '',
    firstname: '',
    lastname: '',
  },
}

function WorkoutPage() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { workout_id } = useParams()
  const [workout, setWorkout] = useState<Workout>(emptyWorkout)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const resWorkout = await axios.get(`${apiUrl}/workouts/${workout_id}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        setWorkout(resWorkout.data.workout)
        setIsLoading(false)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    fetchWorkout()
  }, [token, workout_id])

  const editWorkout = (workout: Workout) => {
    window.location.href = `/treino/${workout.id}/editar`
  }

  if (isLoading) return <Loading />
  if (!workout) window.location.href = '/treinos'

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)]'>
        <div className='flex flex-row items-center justify-between w-full gap-2'>
          <ArrowLeft
            className='w-6 h-6'
            onClick={() => (window.location.href = '/treinos')}
          />
          <h1 className='text-2xl font-semibold'>
            Treino de{' '}
            {workout.clients.firstname + ' ' + workout.clients.lastname}
          </h1>
        </div>

        <div
          id='workout-header'
          className='flex flex-row items-center justify-between w-full mt-10 mb-12'
        >
          <h1 className='text-2xl font-semibold'>{workout.name}</h1>
          <Button
            size={'sm'}
            className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-900 hover:bg-amber-500'
            onClick={() => editWorkout(workout)}
          >
            <Pencil className='w-4 h-4' /> Editar
          </Button>
        </div>

        <div className='flex flex-col w-full gap-2 overflow-y-auto max-h-96'>
          {workout.workout_exercises.map((workout_exercise) => (
            <div
              key={workout_exercise.exercises.id}
              className='flex flex-col px-3 py-2 space-y-2 border border-gray-800 rounded-md'
            >
              <div className='flex flex-row items-center justify-between'>
                <span className='text-xl font-semibold'>
                  {workout_exercise.exercises.name}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-1'>
                <div className='flex flex-row justify-start space-x-2 items center'>
                  <span className='font-semibold'>Sets:</span>
                  <span>{workout_exercise.sets}</span>
                </div>
                <div className='flex flex-row justify-start space-x-2 items center'>
                  <span className='font-semibold'>Reps:</span>
                  <span>{workout_exercise.reps}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

export default WorkoutPage
