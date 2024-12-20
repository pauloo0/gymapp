import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useParams } from 'react-router'

import { useState, useEffect } from 'react'

import { Invoice, Payment } from '@/utils/interfaces'

import axios from 'axios'
import { format } from 'date-fns'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Plus } from 'lucide-react'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

interface InvoiceInfo {
  id: string
  clientName: string
  issue_date: string
  due_date: string
  status: string
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  payments: Payment[]
}

function InvoicePage() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { invoice_id } = useParams()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resInvoice, resPayments] = await Promise.all([
          axios.get(`${apiUrl}/invoices/${invoice_id}`, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get(`${apiUrl}/payments/invoice/${invoice_id}`, {
            headers: {
              'Auth-Token': token,
            },
          }),
        ])

        const invoice: Invoice = resInvoice.data.invoice
        const payments: Payment[] = resPayments.data.payments

        const paidAmount: number = payments.reduce(
          (runningTotal: number, payment: Payment) =>
            Number(runningTotal) + Number(payment.amount),
          0
        )

        let invoiceStatus: string = ''
        switch (invoice.status) {
          case 'paid':
            invoiceStatus = 'Paga'
            break
          case 'partial_payment':
            invoiceStatus = 'Parcelada'
            break
          case 'overdue':
            invoiceStatus = 'Vencida'
            break
          default:
            invoiceStatus = 'Não paga'
            break
        }

        const invoiceInfo: InvoiceInfo = {
          id: invoice.id,
          clientName:
            invoice.subscriptions.clients.firstname +
            ' ' +
            invoice.subscriptions.clients.lastname,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          status: invoiceStatus,
          totalAmount: invoice.amount,
          paidAmount: paidAmount,
          pendingAmount: invoice.amount - paidAmount,
          payments: payments,
        }

        setInvoiceInfo(invoiceInfo)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred.', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, invoice_id])

  const handleNewPayment = () => {
    console.log('Adding new payment')
  }

  if (isLoading) return <Loading />

  if (!invoiceInfo) {
    window.location.href = '/faturas'
  } else {
    return (
      <>
        <Navbar />
        <div className='flex flex-row items-center justify-between w-full gap-2'>
          <div className='flex flex-row items-center justify-start w-full gap-2'>
            <ArrowLeft
              className='w-6 h-6'
              onClick={() => (window.location.href = '/faturas')}
            />
            <h1 className='text-2xl font-semibold'>Fatura</h1>
          </div>
          <div className='w-full text-end'>
            <span className='font-semibold'>Data:</span>{' '}
            {format(invoiceInfo.issue_date, 'yyyy/MM/dd')}
          </div>
        </div>

        <section id='invoice-info' className='grid grid-cols-3 gap-2 my-10'>
          <div className='flex flex-col items-start justify-center col-span-3'>
            <h2 className='text-lg font-semibold'>Nome</h2>
            {invoiceInfo.clientName}
          </div>
          <div className='flex flex-col items-start justify-center col-span-3'>
            <h2 className='text-lg font-semibold'>Vencimento</h2>
            {format(invoiceInfo.due_date, 'yyyy/MM/dd')}
          </div>
          <div className='flex flex-col items-start justify-center col-span-3'>
            <h2 className='text-lg font-semibold'>Estado</h2>
            {invoiceInfo.status}
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Total</h2>
            {invoiceInfo.totalAmount} €
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Pago</h2>
            {invoiceInfo.paidAmount} €
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Pendente</h2>
            {invoiceInfo.pendingAmount} €
          </div>
        </section>

        <section
          id='invoice-payments'
          className='flex flex-col items-center justify-center gap-4'
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Cancelado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceInfo.payments.length > 0 ? (
                invoiceInfo.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(payment.payment_date, 'yyyy/MM/dd')}
                    </TableCell>
                    <TableCell className='text-center'>
                      {payment.amount}
                    </TableCell>
                    <TableCell>{payment.cancelled ? 'Sim' : 'Não'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className='text-center'>
                    Esta fatura não tem pagementos.
                  </TableCell>
                </TableRow>
              )}
              {invoiceInfo.pendingAmount > 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Button
                      size='sm'
                      className='w-full'
                      onClick={handleNewPayment}
                    >
                      <Plus className='w-4 h-6 mr-1' />
                      Adicionar Pagamento
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
      </>
    )
  }
}

export default InvoicePage
