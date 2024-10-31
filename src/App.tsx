import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard/Dashboard'

import Measurements from './pages/Measurements'
import Profile from './pages/Profile/Profile'

import Clients from './pages/Clients/Clients'
import ClientProfile from './pages/Clients/Profile/ClientProfile'
import ClientEdit from './pages/Clients/ClientEdit'
import ClientCreate from './pages/Clients/ClientCreate'

import Schedules from './pages/Schedule/Schedules'
import ScheduleCreate from './pages/Schedule/ScheduleCreate'

import Workouts from './pages/Workouts/Workouts'
import WorkoutCreate from './pages/Workouts/WorkoutCreate'

function App() {
  return (
    <div className='p-4 pt-12'>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/' element={<Dashboard />} />

        <Route path='/avaliacoes' element={<Measurements />} />
        <Route path='/perfil' element={<Profile />} />

        <Route path='/clientes' element={<Clients />} />
        <Route path='/cliente/:id' element={<ClientProfile />} />
        <Route path='/cliente/:id/editar' element={<ClientEdit />} />
        <Route path='/clientes/novo' element={<ClientCreate />} />

        <Route path='/marcacoes' element={<Schedules />} />
        <Route path='/marcacao/novo' element={<ScheduleCreate />} />
        <Route path='/marcacao/novo/:client_id' element={<ScheduleCreate />} />

        <Route path='/treinos' element={<Workouts />} />
        <Route path='/treinos/novo' element={<WorkoutCreate />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
