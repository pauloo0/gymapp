import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import TrainerNavbar from '@/components/TrainerNavbar'
import ClientNavbar from '@/components/ClientNavbar'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function PowerTests() {
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

      <main className='min-h-[calc(100vh_-_64px)] pb-[80px] grid place-items-center'>
        <div className='flex flex-col items-center justify-center gap-8'>
          <h1 className='text-xl'>Esta página ainda não está pronta.</h1>
          <Button
            variant={'default'}
            className='w-full'
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </main>
    </>
  )
}
