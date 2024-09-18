import { Invoice } from '@/utils/interfaces'

function ClientInvoices({ invoices }: { invoices: Invoice[] }) {
  return (
    <>
      {invoices.map((invoice) => (
        <div key={invoice.id}>
          {invoice.issue_date} - {invoice.due_date} | {invoice.amount} € |{' '}
          {invoice.status}
        </div>
      ))}
    </>
  )
}

export default ClientInvoices
