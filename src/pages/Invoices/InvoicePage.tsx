import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { useParams, useNavigate } from 'react-router'

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

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { ArrowLeft, CircleSlash, Plus, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

const formSchema = z.object({
  amount: z.number().min(1, 'O valor é obrigatório.'),
})

interface InvoiceInfo {
  id: string
  clientId: string
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

  const navigate = useNavigate()
  const { invoice_id } = useParams()

  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>()
  const [paymentFormOpen, setPaymentFormOpen] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  })

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
        const payments: Payment[] = resPayments.data.payments.sort(
          (paymentA: Payment, paymentB: Payment) => {
            const dateA = new Date(paymentA.payment_date)
            const dateB = new Date(paymentB.payment_date)

            return dateB.getTime() - dateA.getTime()
          }
        )

        const paidAmount: number = payments.reduce(
          (runningTotal: number, payment: Payment) =>
            Number(runningTotal) +
            (payment.cancelled ? 0 : Number(payment.amount)),
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
          clientId: invoice.subscriptions.clients.id,
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

        form.reset({
          amount: invoiceInfo.pendingAmount,
        })

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
  }, [token, invoice_id, form])

  const cancelAddPayment = () => {
    setPaymentFormOpen(false)
  }

  const onSubmitPayment = async (values: z.infer<typeof formSchema>) => {
    if (!invoiceInfo) window.location.href = '/faturas'

    try {
      setIsLoading(true)

      const paymentInfo = {
        invoice_id: invoiceInfo!.id,
        amount: Number(values.amount),
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        cancelled: false,
      }

      const resNewPayment = await axios.post(
        `${apiUrl}/payments/client/${invoiceInfo!.clientId}`,
        paymentInfo,
        {
          headers: {
            'Auth-Token': token,
          },
        }
      )

      if (resNewPayment.status === 201) {
        navigate(0)
      } else {
        setErrorMessage(resNewPayment.data.message)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data)
      } else {
        console.error('An unexpected error ocurred:', error)
      }
    } finally {
      setIsLoading(true)
    }
  }

  const cancelPayment = async (payment_id: string) => {
    try {
      setIsLoading(true)

      const endpoint = `${apiUrl}/payments/invoice/${
        invoiceInfo!.id
      }/${payment_id}`

      const resCancelPayment = await axios.put(endpoint, null, {
        headers: {
          'Auth-Token': token,
        },
      })

      if (resCancelPayment.status === 200) {
        navigate(0)
      } else {
        setErrorMessage(resCancelPayment.data.message)
      }
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
          <h2 className='w-full text-lg font-semibold'>Pagamentos</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                {invoiceInfo.pendingAmount > 0 && <TableCell></TableCell>}
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
                    <TableCell>
                      {payment.cancelled ? 'Cancelado' : 'Válido'}
                    </TableCell>
                    {invoiceInfo.pendingAmount > 0 && !payment.cancelled && (
                      <TableCell>
                        <CircleSlash
                          strokeWidth={3}
                          className='w-4 h-4 text-red-500'
                          onClick={() => cancelPayment(payment.id)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={invoiceInfo.pendingAmount > 0 ? 4 : 3}
                    className='text-center'
                  >
                    Esta fatura não tem pagementos.
                  </TableCell>
                </TableRow>
              )}
              {invoiceInfo.pendingAmount > 0 && (
                <TableRow>
                  <TableCell colSpan={invoiceInfo.pendingAmount > 0 ? 4 : 3}>
                    <Drawer open={paymentFormOpen}>
                      <DrawerTrigger asChild className='w-full'>
                        <Button
                          size='sm'
                          className='w-full'
                          onClick={() => setPaymentFormOpen(true)}
                        >
                          <Plus className='w-4 h-6 mr-1' />
                          Adicionar Pagamento
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Adicionar Pagamento</DrawerTitle>
                          <DrawerDescription />
                        </DrawerHeader>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmitPayment)}
                            className='px-6'
                          >
                            <FormField
                              name='amount'
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valor recebido</FormLabel>
                                  <FormControl>
                                    <Input
                                      className={`w-full ${
                                        errorMessage ? 'border-red-500' : ''
                                      }`}
                                      type='text'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <DrawerFooter className='grid grid-cols-2 gap-2 mb-6'>
                              <Button
                                type='submit'
                                size={'sm'}
                                className={cn(
                                  'flex items-center justify-center px-3 bg-green-600 hover:bg-green-700',
                                  isLoading
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                                )}
                              >
                                <Save className='w-4 h-4 mr-1' />
                                Guardar
                              </Button>
                              <Button
                                type='reset'
                                size={'sm'}
                                className='flex items-center justify-center px-3'
                                variant='secondary'
                                disabled={isLoading}
                                onClick={cancelAddPayment}
                              >
                                <X className='w-4 h-4 mr-1' />
                                Cancelar
                              </Button>
                            </DrawerFooter>
                          </form>
                        </Form>
                      </DrawerContent>
                    </Drawer>
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
