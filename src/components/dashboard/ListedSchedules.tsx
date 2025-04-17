import { Schedule } from '@/utils/interfaces'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function ListedSchedules({ schedules }: { schedules: Schedule[] }) {
  const navigateToSchedule = (id: string) => {
    window.location.href = `/marcacao/${id}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-2 p-2'>
        {schedules.length === 0 ? (
          <div className='flex flex-col justify-center gap-2'>
            <p className='text-center'>Sem marcações</p>
          </div>
        ) : (
          schedules.map((schedule: Schedule) => (
            <div
              className='flex flex-row items-center justify-between px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl hover:cursor-pointer hover:bg-gray-900 text-gray-50'
              key={schedule.id}
              onClick={() => navigateToSchedule(schedule.id)}
            >
              <div>
                {schedule.clients.firstname + ' ' + schedule.clients.lastname}
              </div>
              <div className='flex flex-col items-end justify-center text-sm text-gray-300'>
                <span>{schedule.time}</span>
                <span>
                  {new Date(schedule.date).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          ))
        )}
        <Button onClick={() => navigateToSchedule('novo')}>
          Fazer marcação
        </Button>
      </CardContent>
    </Card>
  )
}

export default ListedSchedules
