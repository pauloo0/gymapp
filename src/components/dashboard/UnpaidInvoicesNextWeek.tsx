import { useState, useEffect } from 'react'
import { useToken } from '@/utils/tokenWrapper'

import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface Invoice {
  id: string
  issue_date: string
  due_date: string
  amount: number
  status: string
  subscriptions: {
    id: string
    start_date: string
    active: boolean
    package_id: string
    clients: {
      id: string
      firstname: string
      lastname: string
      active: boolean
    }
  }
}

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

function UnpaidInvoicesNextWeek() {
  const token = useToken()

  const [invoices, setInvoices] = useState(emptyInvoices)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(
          'http://localhost:3000/api/invoices/unpaid',
          {
            headers: {
              'Auth-Token': token,
            },
          }
        )

        const unpaidInvoicesDueNextWeek = res.data.invoices.sort(
          (invoiceA: Invoice, invoiceB: Invoice) => {
            const dateA = new Date(invoiceA.due_date)
            const dateB = new Date(invoiceB.due_date)
            return dateA.getTime() - dateB.getTime()
          }
        )

        setInvoices(unpaidInvoicesDueNextWeek)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    fetchInvoices()
  }, [token])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos Pendentes</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-2 p-2'>
        {invoices.length === 0 ? (
          <p className='text-center'>Sem pagamentos pendentes</p>
        ) : (
          invoices.map((invoice: Invoice) => (
            <div
              className={`flex flex-row items-center justify-between px-4 py-2 border rounded-md ${
                invoice.due_date < new Date().toISOString()
                  ? 'bg-red-100 border-red-200'
                  : ''
              }`}
              key={invoice.id}
            >
              {invoice.subscriptions.clients.firstname}{' '}
              {invoice.subscriptions.clients.lastname}
              <div className='flex flex-col items-end justify-center'>
                <span>{invoice.amount} €</span>
                <span className='text-xs'>
                  Expira:{' '}
                  {new Date(invoice.due_date).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default UnpaidInvoicesNextWeek
