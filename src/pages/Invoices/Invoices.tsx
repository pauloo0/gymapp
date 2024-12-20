import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Client, Invoice } from '@/utils/interfaces'

import axios from 'axios'
import { useState, useEffect } from 'react'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { format } from 'date-fns'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function Invoices() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${apiUrl}/clients`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const clients: Client[] = res.data.clients
        setClients(clients)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }

      setIsLoading(false)
    }

    fetchClients()
  }, [token])

  useEffect(() => {
    let endpointUrl = `${apiUrl}/invoices/`
    if (selectedClientId !== '') {
      endpointUrl += `client/${selectedClientId}/`
    }

    const fetchInvoices = async () => {
      try {
        const res = await axios.get(endpointUrl, {
          headers: {
            'Auth-Token': token,
          },
        })

        const sortedInvoices: Invoice[] = res.data.invoices.sort(
          (invoiceA: Invoice, invoiceB: Invoice) => {
            const dateA = new Date(invoiceA.due_date)
            const dateB = new Date(invoiceB.due_date)

            return dateB.getTime() - dateA.getTime()
          }
        )

        setInvoices(sortedInvoices)
        // setFilteredInvoices(sortedInvoices)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error ocurred:', error)
        }
      }
    }

    fetchInvoices()
  }, [token, selectedClientId])

  useEffect(() => {
    setFilteredInvoices(invoices)

    setFilteredInvoices((invoices) => {
      const filteredInvoices = invoices.filter((invoice) => {
        switch (filter) {
          case 'issued':
          case 'overdue':
          case 'paid':
          case 'partial_payment':
            return invoice.status === filter
          default:
            return true
        }
      })

      console.log({ filteredInvoices, filter })

      return filteredInvoices
    })
  }, [filter, invoices, selectedClientId])

  if (isLoading) return <Loading />

  return (
    <>
      <Navbar />
      <h1 className='mb-6 text-xl'>Faturas</h1>

      <div className='p-3 border rounded-lg'>
        <Label className='mb-8'>Nome do cliente</Label>
        <Select onValueChange={(value) => setSelectedClientId(value)}>
          <SelectTrigger>
            <SelectValue placeholder='Selecione o cliente' />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client: Client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.firstname} {client.lastname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        id='filters_and_buttons'
        className='flex flex-row items-center justify-end my-4'
      >
        <div id='filters'>
          <Select onValueChange={(value) => setFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder='Ver ...' defaultValue={'all'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Ver todos</SelectItem>
              <SelectItem value='issued'>Não pagos</SelectItem>
              <SelectItem value='overdue'>Vencidos</SelectItem>
              <SelectItem value='partial_payment'>Parcela</SelectItem>
              <SelectItem value='paid'>Pagos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section
        id='client_invoices'
        className='flex flex-col items-center justify-center gap-4'
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Dt. Venc.</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice: Invoice) => (
                <TableRow
                  key={invoice.id}
                  onClick={() =>
                    (window.location.href = `/fatura/${invoice.id}`)
                  }
                >
                  <TableCell>
                    {invoice.subscriptions.clients.firstname +
                      ' ' +
                      invoice.subscriptions.clients.lastname}
                  </TableCell>
                  <TableCell>
                    {format(invoice.due_date, 'yyyy/MM/dd')}
                  </TableCell>
                  <TableCell className='text-center'>
                    {invoice.amount} €
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className='flex flex-col items-center justify-center'>
                <TableCell>Não encontrei faturas para este cliente.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </>
  )
}

export default Invoices
