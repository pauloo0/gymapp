import axios from 'axios'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Exercise } from '@/utils/interfaces'

import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'

import Loading from '@/components/reusable/Loading'
import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

export default function ExercisePage() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const { exercise_id } = useParams()

  const [exercise, setExercise] = useState<Exercise | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  )
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchExercise = async () => {
      setIsLoading(true)

      try {
        const resExercise = await axios.get(
          `${apiUrl}/exercises/${exercise_id}`
        )

        if (resExercise.status !== 200) {
          throw new Error(resExercise.data)
        }

        setExercise(resExercise.data.exercises)
      } catch (error) {
        console.error('An unexpected error occurred:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExercise()
  }, [token, exercise_id])

  const deleteExercise = async (id: string) => {
    setErrorMessage(undefined)
    setIsLoading(true)

    try {
      const resDelete = await axios.delete(`${apiUrl}/exercises/${id}`, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (resDelete.status !== 200) {
        console.error(resDelete.data)
        throw new Error(resDelete.data)
      }

      setErrorMessage(undefined)
      setSuccessMessage('Exercício apagado com sucesso!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        console.error('An unexpected error ocurred.', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (errorMessage) setIsDialogOpen(true)
  }, [errorMessage])

  useEffect(() => {
    if (successMessage) setIsDialogOpen(true)
  }, [successMessage])

  const handleSuccessClose = () => {
    setIsDialogOpen(false)
    navigate('/admin/exercicios')
  }

  const handleErrorClose = () => {
    setIsDialogOpen(false)
    setErrorMessage(undefined)
  }

  if (isLoading) return <Loading />

  if (!exercise) {
    navigate(-1)
  } else {
    return (
      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        {successMessage && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => !open && handleSuccessClose()}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sucesso</DialogTitle>
              </DialogHeader>
              {successMessage}
              <DialogFooter>
                <Button
                  type='button'
                  variant={'default'}
                  onClick={handleSuccessClose}
                >
                  Ok
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {errorMessage && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => !open && handleErrorClose}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Erro</DialogTitle>
              </DialogHeader>
              {errorMessage}
              <DialogFooter>
                <Button
                  type='button'
                  variant={'default'}
                  onClick={handleErrorClose}
                >
                  Ok
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className='flex flex-row items-center justify-center w-full'>
          <ArrowLeft className='w-6 h-6' onClick={() => navigate(-1)} />

          <div
            id='action-buttons'
            className='flex flex-row items-center justify-end w-full gap-2 mt-10 mb-12'
          >
            <Button
              size={'sm'}
              className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-900 hover:bg-amber-500'
              onClick={() =>
                navigate(`/admin/exercicios/${exercise.id}/editar`)
              }
            >
              <Pencil className='w-4 h-4' /> Editar
            </Button>
            <Button
              size={'sm'}
              className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-red-700 border-red-600 text-gray-50 hover:bg-red-800'
              onClick={() => deleteExercise(exercise.id)}
            >
              <Trash2 className='w-4 h-4' /> Apagar
            </Button>
          </div>
        </div>

        <div
          id='exercise_info'
          className='flex flex-col items-start justify-center gap-2'
        >
          {exercise.media && exercise.media.length > 0 ? (
            <Tabs
              defaultValue={
                exercise.media.some((m) => m.type === 'video')
                  ? 'video'
                  : 'image'
              }
              className='w-full'
            >
              <TabsList className='w-full'>
                {exercise.media.some((m) => m.type === 'video') && (
                  <TabsTrigger value='video' className='w-full text-center'>
                    Video
                  </TabsTrigger>
                )}
                <TabsTrigger value='image' className='w-full text-center'>
                  Imagem
                </TabsTrigger>
              </TabsList>
              <TabsContent value='video'>
                <video
                  src={
                    exercise.media.find((m) => m.type.startsWith('video'))?.url
                  }
                  autoPlay
                  loop
                  muted
                  controls={false}
                  className='w-full max-w-md mb-4 rounded-lg cursor-pointer'
                  playsInline
                  style={{ background: '#000' }}
                  onClick={(e) => {
                    const video = e.currentTarget
                    if (video.requestFullscreen) {
                      video.requestFullscreen()
                    } else if (
                      (
                        video as HTMLVideoElement & {
                          webkitRequestFullscreen?: () => void
                        }
                      ).webkitRequestFullscreen
                    ) {
                      ;(
                        video as HTMLVideoElement & {
                          webkitRequestFullscreen?: () => void
                        }
                      ).webkitRequestFullscreen!()
                    } else if (
                      (
                        video as HTMLVideoElement & {
                          msRequestFullscreen?: () => void
                        }
                      ).msRequestFullscreen
                    ) {
                      ;(
                        video as HTMLVideoElement & {
                          msRequestFullscreen?: () => void
                        }
                      ).msRequestFullscreen!()
                    }
                  }}
                />
              </TabsContent>
              <TabsContent value='image'>
                <img
                  src={exercise.media[selectedImage].url}
                  alt={`Main image ${selectedImage + 1}`}
                  className='w-full max-w-lg mb-4 rounded-lg'
                />
                <div className='flex flex-row'>
                  {exercise.media
                    .filter((m) => m.type === 'image')
                    .map((m, idx) => (
                      <img
                        key={idx}
                        src={m.url}
                        alt={`Imagem ${idx + 1}`}
                        className='w-full'
                        onClick={() => setSelectedImage(idx)}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : null}

          <h1 className='text-2xl font-semibold'>{exercise.name}</h1>
          <div className='flex flex-col items-start justify-center w-full text-gray-500'>
            <p>Parte do corpo: {exercise.bodyparts.name}</p>
            <p>Equipamento: {exercise.equipment.name}</p>
            <p>Medidas: {exercise.equipment.name}</p>
            <p>Dificuldade: {exercise.difficulty_level}</p>
          </div>

          <div className='flex flex-col items-start justify-center my-2'>
            <h2 className='text-lg font-semibold'>Descrição</h2>
            <pre className='font-sans'>{exercise.description}</pre>
          </div>
        </div>
      </main>
    )
  }
}
