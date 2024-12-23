import { useState, useEffect } from 'react'
import { useToken } from '@/utils/tokenWrapper'
import { Schedule, Invoice } from '@/utils/interfaces'

import axios from 'axios'
import { isThisWeek } from 'date-fns'

import Loading from '@/components/reusable/Loading'

import ListedSchedules from '@/components/dashboard/ListedSchedules'
import UnpaidInvoicesNextWeek from '@/components/dashboard/UnpaidInvoicesNextWeek'

const emptySchedules: Schedule[] = [
  {
    id: '',
    date: '',
    time: '',
    clients: {
      id: '',
      firstname: '',
      lastname: '',
    },
  },
]

const emptyInvoices: Invoice[] = [
  {
    id: '',
    issue_date: '',
    due_date: '',
    amount: 0,
    status: '',
    subscriptions: {
      id: '',
      start_date: '',
      active: false,
      package_id: '',
      clients: {
        id: '',
        firstname: '',
        lastname: '',
        active: false,
      },
    },
  },
]

function TrainerDashboard() {
  const apiUrl: string = import.meta.env.VITE_API_URL || ''
  const token = useToken()

  const [isLoading, setIsLoading] = useState(true)
  const [schedules, setSchedules] = useState<Schedule[]>(emptySchedules)
  const [invoices, setInvoices] = useState<Invoice[]>(emptyInvoices)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resSchedules, resInvoices] = await Promise.all([
          axios.get(`${apiUrl}/schedule`, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get(`${apiUrl}/invoices/unpaid`, {
            headers: {
              'Auth-Token': token,
            },
          }),
        ])

        const schedules: Schedule[] = resSchedules.data.schedule

        const sortedSchedules = schedules
          .filter((schedule: Schedule) => isThisWeek(schedule.date))
          .sort((scheduleA: Schedule, scheduleB: Schedule) => {
            const dateA = new Date(scheduleA.date)
            const dateB = new Date(scheduleB.date)
            const timeA = new Date(`1970-01-01T${scheduleA.time}`)
            const timeB = new Date(`1970-01-01T${scheduleB.time}`)
            return (
              dateA.getTime() - dateB.getTime() ||
              timeA.getTime() - timeB.getTime()
            )
          })

        setSchedules(sortedSchedules)

        const unpaidInvoicesDueNextWeek = resInvoices.data.invoices.sort(
          (invoiceA: Invoice, invoiceB: Invoice) => {
            const dateA = new Date(invoiceA.due_date)
            const dateB = new Date(invoiceB.due_date)
            return dateA.getTime() - dateB.getTime()
          }
        )

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
    <div className='flex flex-col gap-4'>
      <ListedSchedules schedules={schedules} />
      <UnpaidInvoicesNextWeek invoices={invoices} />
    </div>
  )
}

export default TrainerDashboard
