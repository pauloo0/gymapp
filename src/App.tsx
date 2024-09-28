import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard/Dashboard'

import Clients from './pages/Clients'
import Schedules from './pages/Schedules'
import Workouts from './pages/Workouts'
import Measurements from './pages/Measurements'
import Profile from './pages/Profile/Profile'

import ClientProfile from './pages/Client Profile/ClientProfile'
import ClientEdit from './pages/Client Edit/ClientEdit'

function App() {
  return (
    <div className='p-4 pt-12'>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/' element={<Dashboard />} />

        <Route path='/clientes' element={<Clients />} />
        <Route path='/marcacoes' element={<Schedules />} />
        <Route path='/treinos' element={<Workouts />} />
        <Route path='/avaliacoes' element={<Measurements />} />
        <Route path='/perfil' element={<Profile />} />

        <Route path='/cliente/:id' element={<ClientProfile />} />
        <Route path='/cliente/:id/editar' element={<ClientEdit />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
