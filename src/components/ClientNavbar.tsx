import { Home, Dumbbell, Logs, CircleUserRound } from 'lucide-react'

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router'

interface Screen {
  id: string
  path: string
}

const useBasePath = () => {
  const location = useLocation()
  const { pathname } = location
  const pathSegments = pathname.split('/')

  // Return the base path: the first segment with a leading slash
  return `/${pathSegments[1] || ''}`
}

function ClientNavbar() {
  const [activeScreen, setActiveScreen] = useState<Screen>({
    id: 'dashboard',
    path: '/',
  })

  const screenPath = useBasePath()

  useEffect(() => {
    let screenId = ''

    switch (screenPath) {
      case '/':
        screenId = 'dashboard'
        break
      case '/marcacoes':
      case '/marcacao':
        screenId = 'schedules'
        break
      case '/treinos':
      case '/treino':
        screenId = 'workouts'
        break
      case '/avaliacoes':
      case '/avaliacao':
        screenId = 'measurements'
        break
      case '/perfil':
      case '/faturas':
      case '/fatura':
        screenId = 'profile'
        break
      default:
        screenId = 'dashboard'
        break
    }

    setActiveScreen({ id: screenId, path: screenPath })
  }, [screenPath])

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  return (
    <div className='fixed bottom-0 left-0 z-50 flex flex-row items-center justify-around w-screen py-5 bg-gray-900 text-gray-50'>
      <Home
        className={`hover:cursor-pointer ${
          activeScreen.id === 'dashboard' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => navigateTo('/')}
      />
      <Dumbbell
        className={`hover:cursor-pointer ${
          activeScreen.id === 'workouts' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => navigateTo('/treinos')}
      />
      <Logs
        className={`hover:cursor-pointer ${
          activeScreen.id === 'measurements' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => navigateTo('/avaliacoes')}
      />
      <CircleUserRound
        className={`hover:cursor-pointer ${
          activeScreen.id === 'profile' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => navigateTo('/perfil')}
      />
    </div>
  )
}

export default ClientNavbar
