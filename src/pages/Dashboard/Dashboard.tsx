import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import axios from 'axios'
import { useEffect } from 'react'
import ClientDashboard from './ClientDashboard'
import TrainerDashboard from './TrainerDashboard'

// interface Client {
//   id: string
//   trainer_id: string
//   firstname: string
//   lastname: string
//   join_date: Date
//   birthday: Date
//   goal: string
// }

// interface Trainer {
//   id: string
//   firstname: string
//   lastname: string
// }

// interface User {
//   id: string
//   role: string
//   username: string
//   email: string
//   clients?: Client[]
//   trainers?: Trainer[]
// }

function Dashboard() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          'http://localhost:3000/api/user/' + user.userId,
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        console.log(res.data.user)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error.response?.status)
          console.log(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    fetchUser()
  }, [token, user.userId])

  return user.userRole === 'client' ? <ClientDashboard /> : <TrainerDashboard />
}

export default Dashboard
