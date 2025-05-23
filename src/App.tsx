import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'

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

import PhysicalTests from './pages/PhysicalTests/PhysicalTests'

import Measurements from './pages/PhysicalTests/Measurements/Measurements'
import MeasurementPage from './pages/PhysicalTests/Measurements/MeasurementPage'
import MeasurementCreate from './pages/PhysicalTests/Measurements/MeasurementCreate'
import MeasurementEdit from './pages/PhysicalTests/Measurements/MeasurementEdit'

import StrengthTests from './pages/PhysicalTests/StrengthTest/StrengthTests'

import PowerTests from './pages/PhysicalTests/PowerTest/PowerTests'

import TrainerPackages from './pages/TrainerPackages/TrainerPackages'
import PackagePage from './pages/TrainerPackages/PackagesPage'
import PackageCreate from './pages/TrainerPackages/PackageCreate'
import PackageEdit from './pages/TrainerPackages/PackageEdit'

import Invoices from './pages/Invoices/Invoices'
import InvoicePage from './pages/Invoices/InvoicePage'

import ClientLocations from './pages/Locations/Locations'
import LocationEdit from './pages/Locations/LocationEdit'
import LocationCreate from './pages/Locations/LocationCreate'

// Admin Routes
import ExercisesList from './pages/Admin/Exercises/ExercisesList'
import ExercisePage from './pages/Admin/Exercises/ExercisePage'
import ExercisesCreate from './pages/Admin/Exercises/ExercisesCreate'
import ExercisesEdit from './pages/Admin/Exercises/ExercisesEdit'

import DBConnectionError from './pages/DBConnectionError'
import Loading from './components/reusable/Loading'

import backgroundLogo from '@/assets/logo.svg'

interface DbStatus {
  status: number
  message: string
}

function App() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

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

  if (isLoading) return <Loading />

  if (!dbStatus || dbStatus.status !== 200) {
    return (
      <main className='bg-gray-950 text-gray-50'>
        <DBConnectionError checkConnection={checkConnection} />
      </main>
    )
  }

  const routesWithoutBackgroundLogo = ['/login', '/register']
  const shouldInsertBackgroundLogo = !routesWithoutBackgroundLogo.some(
    (route) => location.pathname.startsWith(route)
  )

  const routesWithoutPadding = ['/login', '/register']
  const shouldApplyPadding = !routesWithoutPadding.some((route) =>
    location.pathname.startsWith(route)
  )

  return (
    <main
      className='relative bg-gray-950 text-gray-50'
      style={{
        backgroundImage: shouldInsertBackgroundLogo
          ? `url(${backgroundLogo})`
          : 'none',
        backgroundSize: '50% auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 z-0 bg-gray-950 opacity-90' />
      <div className='relative z-10'>
        <div className={`${shouldApplyPadding ? 'p-4 pt-12' : ''}`}>
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
            <Route
              path='/marcacao/novo/:client_id'
              element={<ScheduleCreate />}
            />
            <Route path='/treinos' element={<Workouts />} />
            <Route path='/treino/:workout_id' element={<WorkoutPage />} />
            <Route
              path='/treino/:workout_id/editar'
              element={<WorkoutEdit />}
            />
            <Route path='/treinos/novo' element={<WorkoutCreate />} />

            <Route path='/avaliacoes' element={<PhysicalTests />} />

            <Route
              path='/avaliacoes/antropometricos'
              element={<Measurements />}
            />
            <Route
              path='/avaliacoes/antropometricos/:measurement_id'
              element={<MeasurementPage />}
            />
            <Route
              path='/avaliacoes/antropometricos/novo'
              element={<MeasurementCreate />}
            />
            <Route
              path='/avaliacoes/antropometricos/:measurement_id/editar'
              element={<MeasurementEdit />}
            />

            <Route path='/avaliacoes/forca' element={<StrengthTests />} />

            <Route path='/avaliacoes/potencia' element={<PowerTests />} />

            <Route path='/pacotes' element={<TrainerPackages />} />
            <Route path='/pacote/:package_id' element={<PackagePage />} />
            <Route
              path='/pacote/:package_id/editar'
              element={<PackageEdit />}
            />
            <Route path='/pacotes/novo' element={<PackageCreate />} />
            <Route path='/faturas' element={<Invoices />} />
            <Route path='/fatura/:invoice_id' element={<InvoicePage />} />
            <Route path='/localizacoes' element={<ClientLocations />} />
            <Route
              path='/localizacoes/:location_id/edit'
              element={<LocationEdit />}
            />
            <Route path='/localizacoes/nova' element={<LocationCreate />} />

            <Route path='/admin/exercicios' element={<ExercisesList />} />
            <Route
              path='/admin/exercicios/:exercise_id'
              element={<ExercisePage />}
            />
            <Route
              path='/admin/exercicios/novo'
              element={<ExercisesCreate />}
            />
            <Route
              path='/admin/exercicios/:exercise_id/editar'
              element={<ExercisesEdit />}
            />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </main>
  )
}

export default App
