import { useState, useEffect } from 'react'
import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Invoice } from '@/utils/interfaces'

import axios from 'axios'
import { isThisWeek } from 'date-fns'

import Loading from '@/components/reusable/Loading'

import UnpaidInvoicesNextWeek from '@/components/dashboard/UnpaidInvoicesNextWeek'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import calendarPhoto from '@/assets/calendar.png'

function TrainerDashboard() {
  const apiUrl: string = import.meta.env.VITE_API_URL || ''
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [isLoading, setIsLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const resInvoices = await axios.get(`${apiUrl}/invoices/unpaid`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const unpaidInvoicesDueNextWeek = resInvoices.data.invoices
          .filter((invoice: Invoice) => {
            const invoiceDueDate = new Date(invoice.due_date)
            const isOverdue = invoiceDueDate.getTime() < new Date().getTime()

            return isThisWeek(invoiceDueDate) || isOverdue
          })
          .sort((invoiceA: Invoice, invoiceB: Invoice) => {
            const dateA = new Date(invoiceA.due_date)
            const dateB = new Date(invoiceB.due_date)
            return dateA.getTime() - dateB.getTime()
          })

        setInvoices(unpaidInvoicesDueNextWeek)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
          console.error(error.response?.status)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [token, apiUrl])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className='flex flex-col gap-4 min-h-[calc(100vh_-_64px)]'>
      <UnpaidInvoicesNextWeek
        invoices={invoices}
        userRole={user.userRole || ''}
      />
      <Link to='/marcacoes'>
        <Card
          className='relative bg-center bg-cover'
          style={{ backgroundImage: `url(${calendarPhoto})` }}
        >
          <div className='absolute inset-0 bg-black bg-opacity-70'></div>
          <CardHeader className='relative'>
            <CardTitle className='text-lg font-bold text-white'>
              Agenda
            </CardTitle>
          </CardHeader>
          <CardContent className='relative'></CardContent>
        </Card>
      </Link>
    </div>
  )
}

export default TrainerDashboard
