import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'

import Navbar from '@/components/Navbar'

function Measurements() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  return (
    <>
      <Navbar />
      <div>Measurements</div>
    </>
  )
}

export default Measurements
