import { Invoice } from '@/utils/interfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate } from 'react-router'

function ClientInvoices({ invoices }: { invoices: Invoice[] }) {
  const navigate = useNavigate()

  const navigateTo = (path: string) => {
    navigate(path)
  }

  const orderedInvoices = invoices
    .sort((invoiceA: Invoice, invoiceB: Invoice) => {
      const statusOrder: { [key in string]: number } = {
        overdue: 1,
        partial_paid: 2,
        issued: 3,
        paid: 4,
      }

      return statusOrder[invoiceA.status] - statusOrder[invoiceB.status]
    })
    .map((invoice: Invoice) => {
      switch (invoice.status) {
        case 'overdue':
          invoice.status = 'Vencido'
          break
        case 'partial_payment':
          invoice.status = 'Parcial'
          break
        case 'issued':
          invoice.status = 'Emitido'
          break
        case 'paid':
          invoice.status = 'Pago'
          break
      }

      return invoice
    })

  if (invoices.length === 0) {
    return <p>Nenhuma fatura encontrada.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='p-2'>Data</TableHead>
          <TableHead className='p-2'>Vencimento</TableHead>
          <TableHead className='p-2'>Valor €</TableHead>
          <TableHead className='p-2'>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderedInvoices.map((invoice) => (
          <TableRow
            key={invoice.id}
            onClick={() => navigateTo(`/fatura/${invoice.id}`)}
          >
            <TableCell className='p-2'>
              {new Date(invoice.issue_date).toLocaleDateString('pt-PT')}
            </TableCell>
            <TableCell className='p-2'>
              {new Date(invoice.due_date).toLocaleDateString('pt-PT')}
            </TableCell>
            <TableCell className='p-2'>{invoice.amount}</TableCell>
            <TableCell className='p-2'>{invoice.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ClientInvoices
