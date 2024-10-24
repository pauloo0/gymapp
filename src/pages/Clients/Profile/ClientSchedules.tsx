import { Schedule } from '@/utils/interfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

function ClientSchedules({ schedules }: { schedules: Schedule[] }) {
  const createSchedule = (client_id: string) => {
    window.location.href = '/marcacao/novo/' + client_id
  }

  return (
    <>
      <Button
        className='px-4 py-2 mb-6 font-semibold'
        size='sm'
        onClick={() => createSchedule(schedules[0].clients.id)}
      >
        <Plus className='w-5 h-5 mr-1' /> Adicionar
      </Button>
      {schedules.length === 0 ? (
        <p>Nenhum treino marcado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow></TableRow>
            <TableRow>
              <TableHead className='p-2'>Data</TableHead>
              <TableHead className='p-2'>Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className='p-2'>
                  {new Date(schedule.date).toLocaleDateString('pt-PT')}
                </TableCell>
                <TableCell className='p-2'>{schedule.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}

export default ClientSchedules
