import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useParams } from 'react-router'
import { useState, useEffect } from 'react'

import axios from 'axios'

import { Client } from '@/utils/interfaces'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

const ClientEdit = () => {
  const token = useToken()
  const user = useUser()
  const apiUrl = import.meta.env.VITE_API_URL

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { id } = useParams()
  const [client, setClient] = useState<Client>()

  useEffect(() => {
    const fetchClientInfo = async () => {
      const res = await axios.get(`${apiUrl}/clients/${id}`, {
        headers: {
          'Auth-Token': token,
        },
      })

      const clientData = res.data.client
      setClient(clientData)
    }

    fetchClientInfo()
  }, [token, apiUrl, id])

  if (!client) {
    return <Loading />
  }

  return (
    <>
      <Navbar />
      <div>Editar cliente:</div>
      <p>{client.firstname + ' ' + client.lastname}</p>
    </>
  )
}

export default ClientEdit
