import { useToken } from '@/utils/tokenWrapper'

function Dashboard() {
  const token = useToken()

  if (!token) {
    window.location.href = '/login'
  }

  return (
    <div>
      Hello token: <p className='text-xs'>{token}</p>
    </div>
  )
}

export default Dashboard
