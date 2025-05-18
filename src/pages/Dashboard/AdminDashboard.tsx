import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { LogOut } from 'lucide-react'

import Loading from '@/components/reusable/Loading'

import { Link, useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const token = useToken()
  const user = useUser()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  if (!token || !user) {
    navigate('/login')
  }

  const logout = () => {
    setIsLoading(true)

    setTimeout(() => {
      localStorage.clear()
      setIsLoading(false)
      navigate('/login')
    }, 500)
  }

  if (user.userRole !== 'admin') {
    logout()
  }

  if (isLoading) return <Loading />

  return (
    <div className='flex flex-col gap-4 min-h-[calc(100vh_-_64px)]'>
      <h1 className='text-xl font-semibold'>Gestão de base de dados</h1>
      <Link to='/admin/exercicios'>Exercícios</Link>
      <Link to='/admin/equipamento'>Equipamento</Link>
      <Link to='/admin/partes-corpo'>Partes do corpo</Link>
      <Button
        size={'lg'}
        variant={'destructive'}
        className='w-full bg-red-700 border-red-600 text-gray-50 hover:bg-red-800'
        onClick={logout}
      >
        <LogOut className='w-4 h-4 mr-1' /> Terminar Sessão
      </Button>
    </div>
  )
}
