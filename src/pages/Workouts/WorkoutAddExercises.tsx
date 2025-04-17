import React, { useEffect, useState } from 'react'
import { Exercise, Bodypart, Equipment } from '@/utils/interfaces'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WorkoutAddExercisesProps {
  dbExercises: Exercise[]
  addedExercises: Exercise[]
  setAddedExercises: React.Dispatch<React.SetStateAction<Exercise[]>>
  handleOpenClose: () => void
  bodyparts: Bodypart[]
  equipment: Equipment[]
}

function WorkoutAddExercises({
  dbExercises,
  addedExercises,
  setAddedExercises,
  handleOpenClose,
  bodyparts,
  equipment,
}: WorkoutAddExercisesProps) {
  const [exercisesToAdd, setExercisesToAdd] =
    useState<Exercise[]>(addedExercises)

  dbExercises = dbExercises.filter(
    (exercise) => !addedExercises.find((e) => exercise.id === e.id)
  )

  const [filteredExercises, setFilteredExercises] =
    useState<Exercise[]>(dbExercises)
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    bodypart: '',
    equipment: '',
  })

  const handleExercise = (exercise: Exercise) => {
    if (exercisesToAdd.find((e) => exercise.id === e.id)) {
      setExercisesToAdd((prevExercises) =>
        prevExercises.filter((e) => exercise.id !== e.id)
      )
    } else {
      setExercisesToAdd((prevExercises) => [...prevExercises, exercise])
    }
  }

  useEffect(() => {
    let updatedExercises = dbExercises

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
  }, [dbExercises, searchFilters])

  const handleAddExercise = (newExercises: Exercise[]) => {
    setAddedExercises([...newExercises])
    handleOpenClose()
  }

  return (
    <div className='px-6 relative h-[90vh]'>
      <div
        id='exercisesFilter'
        className='grid grid-cols-2 gap-4 px-4 py-3 mb-4 border border-gray-800 rounded-lg'
      >
        <div className='flex flex-col items-start justify-start col-span-2 gap-1.5'>
          {/* <Label htmlFor='name'>Nome</Label> */}
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
          {/* <Label htmlFor='bodypart'>Parte do corpo</Label> */}
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
          {/* <Label htmlFor='equipment'>Equipamento</Label> */}
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
      </div>

      <div id='exerciseList' className='grid grid-cols-1 gap-2 overflow-auto'>
        {filteredExercises.map((exercise) => (
          <div
            className={`px-3 py-2 cursor-pointer border border-gray-700 rounded hover:bg-gray-800 ${
              exercisesToAdd.find((e) => exercise.id === e.id)
                ? 'border-l-8 border-lime-500 bg-gray-800'
                : ''
            }`}
            key={exercise.id}
            onClick={() => handleExercise(exercise)}
          >
            {exercise.name}
          </div>
        ))}
      </div>

      <div className='absolute flex flex-col items-center justify-center gap-2 left-6 right-6 bottom-6'>
        <Button
          variant={'default'}
          size={'sm'}
          className='w-full'
          onClick={() => handleAddExercise(exercisesToAdd)}
        >
          Adicionar
        </Button>
        <Button
          variant={'secondary'}
          size={'sm'}
          className='w-full'
          onClick={handleOpenClose}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}

export default WorkoutAddExercises
