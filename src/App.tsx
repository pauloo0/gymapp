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

function App() {
  return (
    <div className='flex flex-col items-center justify-center w-screen h-screen'>
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

        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
