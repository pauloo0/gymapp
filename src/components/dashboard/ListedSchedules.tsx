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
            <Button onClick={() => navigateToSchedule('novo')}>
              Fazer marcação
            </Button>
          </div>
        ) : (
          schedules.map((schedule: Schedule) => (
            <div
              className='flex flex-row items-center justify-between px-4 py-2 border rounded-xl hover:cursor-pointer hover:bg-slate-100'
              key={schedule.id}
              onClick={() => navigateToSchedule(schedule.id)}
            >
              <div>
                {schedule.clients.firstname + ' ' + schedule.clients.lastname}
              </div>
              <div className='flex flex-col items-end justify-center text-sm text-slate-500'>
                <span>{schedule.time}</span>
                <span>
                  {new Date(schedule.date).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default ListedSchedules
