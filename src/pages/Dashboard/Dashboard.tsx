import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import ClientDashboard from './ClientDashboard'
import TrainerDashboard from './TrainerDashboard'

import ClientNavbar from '@/components/ClientNavbar'
import TrainerNavbar from '@/components/TrainerNavbar'

function Dashboard() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  if (user.userRole === 'client') {
    return (
      <>
        <ClientNavbar />
        <ClientDashboard />
      </>
    )
  }

  if (user.userRole === 'trainer') {
    return (
      <>
        <TrainerNavbar />
        <TrainerDashboard />
      </>
    )
  }
}

export default Dashboard
