import { useState, useEffect } from 'react'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useNavigate } from 'react-router-dom'

import Loading from '@/components/reusable/Loading'
import axios from 'axios'
import { Bodypart, Equipment, Exercise } from '@/utils/interfaces'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

export default function ExercisesList() {
  const token = useToken()
  const user = useUser()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [bodyparts, setBodyparts] = useState<Bodypart[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    bodypart: '',
    equipment: '',
  })

  if (!token || !user) {
    navigate('/login')
  }

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true)

        const resExercises = await axios.get(`${apiUrl}/exercises`)

        if (!resExercises) {
          console.error('Exercises not found')
        }

        setExercises(resExercises.data.exercises)
      } catch (error) {
        console.error('An unexpected error occurred:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchBodyparts = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/bodyparts`)
        const bodyparts: Bodypart[] = res.data.bodyparts
        setBodyparts(bodyparts)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    const fetchEquipment = async () => {
      try {
        setIsLoading(true)

        const res = await axios.get(`${apiUrl}/equipment`)
        const equipment: Equipment[] = res.data.equipment
        setEquipment(equipment)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    fetchExercises()
    fetchEquipment()
    fetchBodyparts()
  }, [token])

  useEffect(() => {
    setFilteredExercises(exercises)

    let updatedExercises = exercises

    if (searchFilters.name) {
      updatedExercises = updatedExercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      )
    }

    if (searchFilters.bodypart) {
      updatedExercises = updatedExercises.filter(
        (exercise) => exercise.bodyparts.id === searchFilters.bodypart
      )
    }

    if (searchFilters.equipment) {
      updatedExercises = updatedExercises.filter(
        (exercise) => exercise.equipment.id === searchFilters.equipment
      )
    }

    setFilteredExercises(updatedExercises)
  }, [searchFilters, exercises])

  if (isLoading) return <Loading />

  if (!exercises) navigate(-1)

  return (
    <main className='min-h-[calc(100vh_-_64px)] pb-80px'>
      <h1 className='mb-10 text-2xl'>Lista de exercícios</h1>

      <div
        id='exercisesFilter'
        className='grid grid-cols-2 gap-4 px-4 py-3 mb-4 border border-gray-800 rounded-lg'
      >
        <div className='flex flex-col items-start justify-start col-span-2 gap-1.5'>
          <Input
            id='name'
            name='name'
            placeholder='Nome do exercício'
            type='text'
            value={searchFilters.name}
            onChange={(e) =>
              setSearchFilters({ ...searchFilters, name: e.target.value })
            }
          />
        </div>

        <div className='flex flex-col items-start justify-start gap-1.5'>
          <Select
            value={searchFilters.bodypart}
            onValueChange={(selectedBodypart) =>
              setSearchFilters({ ...searchFilters, bodypart: selectedBodypart })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Parte do corpo' />
            </SelectTrigger>
            <SelectContent>
              {bodyparts.map((bodypart) => (
                <SelectItem key={bodypart.id} value={bodypart.id}>
                  {bodypart.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col items-start justify-start gap-1.5'>
          <Select defaultValue=''>
            <SelectTrigger>
              <SelectValue placeholder='Equipamento' />
            </SelectTrigger>
            <SelectContent>
              {equipment.map((equip) => (
                <SelectItem key={equip.id} value={equip.id}>
                  {equip.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className='col-span-2'
          size={'sm'}
          onClick={() => navigate('/admin/exercicios/novo')}
        >
          <Plus className='w-5 h-5 mr-1' /> Novo exercício
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Equipamento</TableHead>
            <TableHead>Pt. corpo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExercises.map((exercise) => (
            <TableRow
              key={exercise.id}
              onClick={() => navigate(`/admin/exercicios/${exercise.id}`)}
            >
              <TableCell>{exercise.name}</TableCell>
              <TableCell>{exercise.equipment.name}</TableCell>
              <TableCell>{exercise.bodyparts.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}
