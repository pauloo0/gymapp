import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className='flex flex-col items-center justify-center w-screen h-screen'>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<Dashboard />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
