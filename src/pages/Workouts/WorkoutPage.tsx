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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function WorkoutPage() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { workout_id } = useParams()
  const [workout, setWorkout] = useState<Workout | undefined>(undefined)
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

      {workout && (
        <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
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
            className='grid w-full grid-cols-4 gap-6 my-10'
          >
            <h1 className='col-span-3 text-2xl font-semibold'>
              {workout.name}
            </h1>

            <div
              id='action-buttons'
              className='flex flex-row items-center justify-between gap-4'
            >
              <Button
                size={'sm'}
                className='flex flex-row items-center justify-center flex-1 gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-900 hover:bg-amber-500'
                onClick={() => editWorkout(workout)}
              >
                <Pencil className='w-4 h-4' /> Editar
              </Button>
            </div>

            <div className='flex flex-col items-start justify-center col-span-4 gap-2 px-3 py-2 border border-gray-800 rounded-md'>
              <h3 className='text-lg font-bold'>Notas</h3>

              <p>{workout.notes}</p>
            </div>
          </div>

          <div className='flex flex-col w-full gap-2 overflow-y-auto'>
            <h3 className='text-xl font-bold'>Exercícios</h3>
            {workout.workout_exercises.map((workout_exercise) => (
              <div
                key={workout_exercise.exercises.id}
                className='flex flex-col px-3 py-2 space-y-2 border border-gray-800 rounded-md'
              >
                <div className='flex flex-row items-center justify-between'>
                  <span className='text-lg font-semibold'>
                    {workout_exercise.exercises.name}
                  </span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Série</TableHead>
                      <TableHead>Reps</TableHead>
                      <TableHead>Kg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workout_exercise.sets.map((set) => (
                      <TableRow key={set.id}>
                        <TableCell>{set.set_number}</TableCell>
                        <TableCell>{set.reps}</TableCell>
                        <TableCell>{set.weight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </main>
      )}
    </>
  )
}

export default WorkoutPage
