import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import ClientDashboard from './ClientDashboard'
import TrainerDashboard from './TrainerDashboard'

import ClientNavbar from '@/components/ClientNavbar'
import TrainerNavbar from '@/components/TrainerNavbar'
import { useNavigate } from 'react-router'
import AdminDashboard from './AdminDashboard'

function Dashboard() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  if (user.userRole === 'client') {
    return (
      <div className='pb-[80px]'>
        <ClientNavbar />
        <ClientDashboard />
      </div>
    )
  }

  if (user.userRole === 'trainer') {
    return (
      <div className='pb-[80px]'>
        <TrainerNavbar />
        <TrainerDashboard />
      </div>
    )
  }

  if (user.userRole === 'admin') {
    return (
      <div className='pb-[80px]'>
        <AdminDashboard />
      </div>
    )
  }
}

export default Dashboard
