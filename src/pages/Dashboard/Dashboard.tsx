import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import ClientDashboard from './ClientDashboard'
import TrainerDashboard from './TrainerDashboard'

import Navbar from '@/components/Navbar'

function Dashboard() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  return (
    <>
      <Navbar />
      {user.userRole === 'client' ? <ClientDashboard /> : <TrainerDashboard />}
    </>
  )
}

export default Dashboard
