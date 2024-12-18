import { useState, useEffect } from 'react'

import { Routes, Route } from 'react-router'

import { testDBConnection } from './utils/functions'

import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard/Dashboard'

import Profile from './pages/Profile/Profile'

import Clients from './pages/Clients/Clients'
import ClientProfile from './pages/Clients/Profile/ClientProfile'
import ClientEdit from './pages/Clients/ClientEdit'
import ClientCreate from './pages/Clients/ClientCreate'

import Schedules from './pages/Schedule/Schedules'
import SchedulePage from './pages/Schedule/SchedulePage'
import ScheduleCreate from './pages/Schedule/ScheduleCreate'
import ScheduleEdit from './pages/Schedule/ScheduleEdit'

import Workouts from './pages/Workouts/Workouts'
import WorkoutCreate from './pages/Workouts/WorkoutCreate'
import WorkoutPage from './pages/Workouts/WorkoutPage'
import WorkoutEdit from './pages/Workouts/WorkoutEdit'

import Measurements from './pages/Measurements/Measurements'
import MeasurementPage from './pages/Measurements/MeasurementPage'
import MeasurementCreate from './pages/Measurements/MeasurementCreate'
import MeasurementEdit from './pages/Measurements/MeasurementEdit'

import TrainerPackages from './pages/TrainerPackages/TrainerPackages'
import PackagePage from './pages/TrainerPackages/PackagesPage'
import PackageCreate from './pages/TrainerPackages/PackageCreate'

import DBConnectionError from './pages/DBConnectionError'

interface DbStatus {
  status: number
  message: string
}

function App() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkConnection = async () => {
    try {
      setIsLoading(true)

      const result = await testDBConnection()
      setDbStatus(result)
    } catch (error) {
      console.error('Failed to check database connection:', error)
      setDbStatus({
        status: 500,
        message: 'Erro ao verificar conexão com a base de dados',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (isLoading) {
    return <p className='text-4xl font-bold'>A verificar conexão...</p>
  }

  if (!dbStatus || dbStatus.status !== 200) {
    return <DBConnectionError checkConnection={checkConnection} />
  }

  return (
    <div className='p-4 pt-12'>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/' element={<Dashboard />} />

        <Route path='/perfil' element={<Profile />} />

        <Route path='/clientes' element={<Clients />} />
        <Route path='/cliente/:id' element={<ClientProfile />} />
        <Route path='/cliente/:id/editar' element={<ClientEdit />} />
        <Route path='/clientes/novo' element={<ClientCreate />} />

        <Route path='/marcacoes' element={<Schedules />} />
        <Route path='/marcacao/:schedule_id' element={<SchedulePage />} />
        <Route
          path='/marcacao/:schedule_id/editar'
          element={<ScheduleEdit />}
        />
        <Route path='/marcacao/novo' element={<ScheduleCreate />} />
        <Route path='/marcacao/novo/:client_id' element={<ScheduleCreate />} />

        <Route path='/treinos' element={<Workouts />} />
        <Route path='/treino/:workout_id' element={<WorkoutPage />} />
        <Route path='/treino/:workout_id/editar' element={<WorkoutEdit />} />
        <Route path='/treinos/novo' element={<WorkoutCreate />} />

        <Route path='/avaliacoes' element={<Measurements />} />
        <Route
          path='/avaliacao/:measurement_id'
          element={<MeasurementPage />}
        />
        <Route path='/avaliacoes/novo' element={<MeasurementCreate />} />
        <Route
          path='/avaliacao/:measurement_id/editar'
          element={<MeasurementEdit />}
        />

        <Route path='/pacotes' element={<TrainerPackages />} />
        <Route path='/pacote/:package_id' element={<PackagePage />} />
        <Route path='/pacotes/novo' element={<PackageCreate />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
