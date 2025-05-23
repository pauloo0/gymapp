import { Workout } from '@/utils/interfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate } from 'react-router'

function ClientWorkouts({ workouts }: { workouts: Workout[] }) {
  const navigate = useNavigate()

  const navigateTo = (path: string) => {
    navigate(path)
  }

  if (workouts.length === 0) {
    return <p>Nenhum plano de treino criado.</p>
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
