import { useState, useEffect } from 'react'

const getUser = () => {
  const userId = localStorage.getItem('user')
  const userRole = localStorage.getItem('role')

  return { userId, userRole }
}

const setUser = (userData: { userId: string; role: string }) => {
  localStorage.setItem('user', userData.userId)
  localStorage.setItem('role', userData.role)
}

const useUser = () => {
  const [user, setUserState] = useState(getUser())

  useEffect(() => {
    setUserState(getUser())
  }, [])

  return user
}

export { getUser, setUser, useUser }
