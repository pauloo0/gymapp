import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import axios from 'axios'

import { useState, useEffect } from 'react'

import { User } from '@/utils/interfaces'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Profile() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userInfo, setUserInfo] = useState<User>()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${apiUrl}/user/${user.userId}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const userData = res.data.user
        setUserInfo(userData)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred.', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [token, user])

  if (isLoading) return <Loading />
  if (!user) window.history.back()

  // Tailwind classes in a variable
  const label_group = 'flex flex-col items-start justify-center gap-1'
  const label = 'text-sm font-semibold leading-none'

  const redirectPackages = () => {
    window.location.href = '/pacotes'
  }
  const redirectInvoices = () => {
    window.location.href = '/faturas'
  }

  const logout = () => {
    setIsLoading(true)

    setTimeout(() => {
      localStorage.clear()
      window.location.href = '/login'
    }, 1000)
  }

  return (
    <>
      <Navbar />

      <main className='min-h-[calc(100vh_-_64px)]'>
        <h1 className='mb-6 text-xl'>Meu Perfil</h1>

        {userInfo && (
          <>
            <div id='profile-info' className='grid grid-cols-1 gap-4 mb-6'>
              <div className={label_group}>
                <p className={label}>Nome</p>
                <p>
                  {userInfo.clients
                    ? userInfo.clients[0].firstname +
                      ' ' +
                      userInfo.clients[0].lastname
                    : userInfo.trainers
                    ? userInfo.trainers[0].firstname +
                      ' ' +
                      userInfo.trainers[0].lastname
                    : ''}
                </p>
              </div>
              <div className={label_group}>
                <p className={label}>Username</p>
                <p>{userInfo.username}</p>
              </div>
              <div className={label_group}>
                <p className={label}>Email</p>
                <p>{userInfo.email}</p>
              </div>
            </div>
            <div className='grid grid-cols-1 gap-2'>
              <Button
                size={'lg'}
                variant={'secondary'}
                className='w-full text-gray-900 bg-gray-300 hover:bg-lime-500 hover:border-lime-600'
                onClick={redirectPackages}
              >
                Os meus pacotes
              </Button>
              <Button
                size={'lg'}
                variant={'secondary'}
                className='w-full text-gray-900 bg-gray-300 hover:bg-lime-500 hover:border-lime-600'
                onClick={redirectInvoices}
              >
                Faturas
              </Button>
              <Button
                size={'lg'}
                variant={'destructive'}
                className='w-full bg-red-700 border-red-600 text-gray-50 hover:bg-red-800'
                onClick={logout}
              >
                <LogOut className='w-4 h-4 mr-1' /> Terminar Sessão
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  )
}

export default Profile
