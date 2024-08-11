import { useState, useEffect } from 'react'

const getToken = () => {
  const token = localStorage.getItem('token')
  return token
}

const setToken = (token: string) => {
  localStorage.setItem('token', token)
}

const useToken = () => {
  const [token, setTokenState] = useState(getToken())

  useEffect(() => {
    setTokenState(getToken())
  }, [])

  return token
}

export { getToken, setToken, useToken }
