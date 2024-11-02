import {
  Home,
  Users,
  CalendarDays,
  Dumbbell,
  Logs,
  CircleUserRound,
} from 'lucide-react'

import { useState, useEffect } from 'react'

interface Screen {
  id: string
  path: string
}

function Navbar() {
  const [activeScreen, setActiveScreen] = useState<Screen>({
    id: 'dashboard',
    path: '/',
  })

  useEffect(() => {
    const screenPath = window.location.pathname
    let screenId = activeScreen.id

    switch (screenPath) {
      case '/':
        screenId = 'dashboard'
        break
      case '/clientes':
        screenId = 'clients'
        break
      case '/marcacoes':
        screenId = 'schedules'
        break
      case '/treinos':
        screenId = 'workouts'
        break
      case '/avaliacoes':
        screenId = 'measurements'
        break
      case '/perfil':
        screenId = 'profile'
        break
      default:
        screenId = 'dashboard'
        break
    }

    setActiveScreen({ id: screenId, path: screenPath })
  }, [])

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  return (
    <div className='fixed z-50 bottom-0 left-0 flex flex-row items-center justify-around w-screen py-5 text-white bg-slate-900'>
      <Home
        className={`hover:cursor-pointer ${
          activeScreen.id === 'dashboard' && 'text-opacity-100 text-teal-400'
        }`}
        onClick={() => navigateTo('/')}
      />
      <Users
        className={`hover:cursor-pointer ${
          activeScreen.id === 'clients' && 'text-opacity-100 text-teal-400'
        }`}
        onClick={() => navigateTo('/clientes')}
      />
      <CalendarDays
        className={`hover:cursor-pointer ${
          activeScreen.id === 'schedules' && 'text-opacity-100 text-teal-400'
        }`}
        onClick={() => navigateTo('/marcacoes')}
      />
      <Dumbbell
        className={`hover:cursor-pointer ${
          activeScreen.id === 'workouts' && 'text-opacity-100 text-teal-400'
        }`}
        onClick={() => navigateTo('/treinos')}
      />
      <Logs
        className={`hover:cursor-pointer ${
          activeScreen.id === 'measurements' && 'text-opacity-100 text-teal-400'
        }`}
        onClick={() => navigateTo('/avaliacoes')}
      />
      <CircleUserRound
        className={`hover:cursor-pointer ${
          activeScreen.id === 'profile' && 'text-opacity-100 text-teal-400'
        }`}
        onClick={() => navigateTo('/perfil')}
      />
    </div>
  )
}

export default Navbar
