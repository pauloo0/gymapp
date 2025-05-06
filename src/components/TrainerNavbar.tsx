import {
  Home,
  Users,
  CalendarDays,
  Dumbbell,
  Logs,
  CircleUserRound,
} from 'lucide-react'

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

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

function TrainerNavbar() {
  const navigate = useNavigate()

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
      case '/clientes':
      case '/cliente':
        screenId = 'clients'
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
      case '/pacotes':
      case '/pacote':
      case '/faturas':
      case '/fatura':
      case '/localizacoes':
        screenId = 'profile'
        break
      default:
        screenId = 'dashboard'
        break
    }

    setActiveScreen({ id: screenId, path: screenPath })
  }, [screenPath])

  const handleClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className='fixed bottom-0 left-0 z-50 flex flex-row items-center justify-around w-screen pt-5 pb-10 bg-gray-900 text-gray-50'>
      <Home
        className={`hover:cursor-pointer ${
          activeScreen.id === 'dashboard' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => handleClick('/')}
      />
      <Users
        className={`hover:cursor-pointer ${
          activeScreen.id === 'clients' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => handleClick('/clientes')}
      />
      <CalendarDays
        className={`hover:cursor-pointer ${
          activeScreen.id === 'schedules' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => handleClick('/marcacoes')}
      />
      <Dumbbell
        className={`hover:cursor-pointer ${
          activeScreen.id === 'workouts' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => handleClick('/treinos')}
      />
      <Logs
        className={`hover:cursor-pointer ${
          activeScreen.id === 'measurements' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => handleClick('/avaliacoes')}
      />
      <CircleUserRound
        className={`hover:cursor-pointer ${
          activeScreen.id === 'profile' && 'text-opacity-100 text-lime-500'
        }`}
        onClick={() => handleClick('/perfil')}
      />
    </div>
  )
}

export default TrainerNavbar
