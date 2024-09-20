import { Workout } from '@/utils/interfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function ClientWorkouts({ workouts }: { workouts: Workout[] }) {
  const navigateTo = (path: string) => {
    window.location.href = path
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='p-2'>Nome</TableHead>
          <TableHead className='p-2'>Ativo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workouts.map((workout) => (
          <TableRow
            key={workout.id}
            onClick={() => navigateTo(`/treinos/${workout.id}`)}
          >
            <TableCell className='p-2'>{workout.name}</TableCell>
            <TableCell className='p-2'>
              {workout.active ? 'Sim' : 'Não'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ClientWorkouts
