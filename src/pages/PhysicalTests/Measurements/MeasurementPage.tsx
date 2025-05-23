import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useNavigate, useParams } from 'react-router'

import { useEffect, useState } from 'react'

import { Measurement } from '@/utils/interfaces'

import axios from 'axios'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'

import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import ClientNavbar from '@/components/ClientNavbar'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function MeasurementPage() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const { measurement_id } = useParams()

  const userRole = user.userRole

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [measurement, setMeasurement] = useState<Measurement | null>(null)

  useEffect(() => {
    const fetchMeasurement = async () => {
      try {
        const resMeasurement = await axios.get(
          `${apiUrl}/measurements/${measurement_id}`,
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        const measurement = resMeasurement.data.measurement
        setMeasurement(measurement)
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

    fetchMeasurement()
  }, [token, measurement_id])

  // Tailwind classes in a variable
  const label_group = 'flex flex-col items-start justify-center gap-1'
  const label = 'text-sm font-semibold leading-none'

  const editMeasurement = (measurement: Measurement) => {
    navigate(`/avaliacoes/antropometricos/${measurement.id}/editar`)
  }

  if (isLoading) return <Loading />

  if (!measurement) {
    navigate('/avaliacoes/antropometricos')
  } else {
    return (
      <>
        {userRole === 'client' ? <ClientNavbar /> : <TrainerNavbar />}

        <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
          <div className='flex flex-row justify-between w-full gap-2 items-cnter'>
            <ArrowLeft
              className='w-6 h-6'
              onClick={() => navigate('/avaliacoes/antropometricos')}
            />
            <h1 className='text-2xl font-semibold'>
              Avaliação de
              {' ' +
                measurement.clients.firstname +
                ' ' +
                measurement.clients.lastname}
            </h1>
          </div>

          <div
            id='measurement-header'
            className='flex flex-row items-center justify-between w-full mt-10 mb-12'
          >
            <div className={cn(label_group, 'col-span-2')}>
              <p className={label}>Data da avaliação</p>
              <p>{format(measurement.date, 'yyyy-MM-dd')}</p>
            </div>

            {userRole === 'trainer' && (
              <Button
                size={'sm'}
                className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-900 hover:bg-amber-500'
                onClick={() => editMeasurement(measurement)}
              >
                <Pencil className='w-4 h-4' /> Editar
              </Button>
            )}
          </div>

          <div
            id='measurement-info'
            className='grid grid-cols-2 gap-2 overflow-y-auto mb-14'
          >
            <section className='col-span-2 mb-4 font-semibold'>
              <p>Dados gerais</p>
            </section>

            <div className={label_group}>
              <p className={label}>Peso</p>
              <p>{measurement.weight} Kg</p>
            </div>
            <div className={label_group}>
              <p className={label}>Altura</p>
              <p>{measurement.height} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Massa Gorda (%)</p>
              <p>{measurement.body_fat_pct} %</p>
            </div>
            <div className={label_group}>
              <p className={label}>Massa Gorda (Kg)</p>
              <p>{measurement.body_fat} Kg</p>
            </div>
            <div className={label_group}>
              <p className={label}>Massa Muscular (%)</p>
              <p>{measurement.muscle_mass_pct} %</p>
            </div>
            <div className={label_group}>
              <p className={label}>Massa Muscular (Kg)</p>
              <p>{measurement.muscle_mass} Kg</p>
            </div>
            <div className={label_group}>
              <p className={label}>Água</p>
              <p>{measurement.water_pct} %</p>
            </div>
            <div className={label_group}>
              <p className={label}>IMC</p>
              <p>{measurement.bmi}</p>
            </div>
            <div className={label_group}>
              <p className={label}>Gordura Visceral</p>
              <p>{measurement.visceral_fat}</p>
            </div>

            <section className='col-span-2 my-4 font-semibold'>
              <p>Perímetros</p>
            </section>

            <div className={label_group}>
              <p className={label}>Busto</p>
              <p>{measurement.chest} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Braço Esquerdo</p>
              <p>{measurement.leftarm} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Braço Direito</p>
              <p>{measurement.rightarm} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Cintura</p>
              <p>{measurement.waist} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Anca</p>
              <p>{measurement.hip} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Coxa Esquerda</p>
              <p>{measurement.leftthigh} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Coxa Direita</p>
              <p>{measurement.rightthigh} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Gémeo Esquerdo</p>
              <p>{measurement.leftcalf} cm</p>
            </div>
            <div className={label_group}>
              <p className={label}>Gémeo Direito</p>
              <p>{measurement.rightcalf} cm</p>
            </div>
          </div>
        </main>
      </>
    )
  }
}

export default MeasurementPage
