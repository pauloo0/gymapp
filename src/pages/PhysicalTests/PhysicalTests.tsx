import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useNavigate, Link } from 'react-router-dom'

import TrainerNavbar from '@/components/TrainerNavbar'
import ClientNavbar from '@/components/ClientNavbar'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import anthropometricData from '@/assets/anthropometric_test.jpg'
import powerTest from '@/assets/power_test.jpg'
import strengthTest from '@/assets/strengh_test.jpg'

export default function PhysicalTests() {
  const navigate = useNavigate()
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const userRole = user.userRole

  return (
    <>
      {userRole === 'client' ? <ClientNavbar /> : <TrainerNavbar />}

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px]'>
        <h1 className='mb-10 text-2xl'>Avaliações físicas</h1>

        <section className='flex flex-col gap-2'>
          <Link to='/avaliacoes/antropometricos'>
            <Card
              className='relative bg-center bg-cover'
              style={{ backgroundImage: `url(${anthropometricData})` }}
            >
              <div className='absolute inset-0 bg-black rounded-md bg-opacity-60'></div>
              <CardHeader className='relative'>
                <CardTitle className='text-lg fond-bold text-gray-50'>
                  Dados Antropométricos
                </CardTitle>
              </CardHeader>
              <CardContent className='relative'></CardContent>
            </Card>
          </Link>

          <Link to='/avaliacoes/forca'>
            <Card
              className='relative bg-center bg-cover'
              style={{ backgroundImage: `url(${strengthTest})` }}
            >
              <div className='absolute inset-0 bg-black rounded-md bg-opacity-60'></div>
              <CardHeader className='relative'>
                <CardTitle className='text-lg fond-bold text-gray-50'>
                  Força Máxima
                </CardTitle>
              </CardHeader>
              <CardContent className='relative'></CardContent>
            </Card>
          </Link>

          <Link to='/avaliacoes/potencia'>
            <Card
              className='relative bg-center bg-cover'
              style={{ backgroundImage: `url(${powerTest})` }}
            >
              <div className='absolute inset-0 bg-black rounded-md bg-opacity-60'></div>
              <CardHeader className='relative'>
                <CardTitle className='text-lg fond-bold text-gray-50'>
                  Potência Muscular
                </CardTitle>
              </CardHeader>
              <CardContent className='relative'></CardContent>
            </Card>
          </Link>
        </section>
      </main>
    </>
  )
}
