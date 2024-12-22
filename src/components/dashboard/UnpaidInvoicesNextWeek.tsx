import { Invoice } from '@/utils/interfaces'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

function UnpaidInvoicesNextWeek({ invoices }: { invoices: Invoice[] }) {
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
              onClick={() => (window.location.href = `/fatura/${invoice.id}`)}
            >
              {invoice.subscriptions.clients.firstname}{' '}
              {invoice.subscriptions.clients.lastname}
              <div className='flex flex-col items-end justify-center'>
                <span>{invoice.amount} €</span>
                <span className='text-xs'>
                  Vencimento:{' '}
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
