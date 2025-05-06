import { useNavigate } from 'react-router'

import { Invoice } from '@/utils/interfaces'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

function UnpaidInvoicesNextWeek({
  invoices,
  userRole,
}: {
  invoices: Invoice[] | null
  userRole: string
}) {
  const navigate = useNavigate()

  if (userRole === '') {
    navigate('/login')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos Pendentes</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-2 p-2'>
        {!invoices || invoices.length === 0 ? (
          <p className='text-center'>Sem pagamentos pendentes</p>
        ) : (
          invoices.map((invoice: Invoice) => (
            <div
              className={`text-gray-50 flex flex-row items-center justify-between px-4 py-2 border rounded-md ${
                new Date(invoice.due_date).getTime() < new Date().getTime()
                  ? 'bg-red-700 text-gray-50 border-red-600 hover:bg-red-800'
                  : 'bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-900'
              }`}
              key={invoice.id}
              onClick={() => navigate(`/fatura/${invoice.id}`)}
            >
              {invoice.subscriptions.clients.firstname}{' '}
              {invoice.subscriptions.clients.lastname}
              <div className='flex flex-col items-end justify-center'>
                <span>{invoice.amount} €</span>
                <span className='text-xs text-gray-300'>
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
