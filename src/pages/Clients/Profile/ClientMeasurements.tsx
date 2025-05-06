import { Measurement } from '@/utils/interfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate } from 'react-router'

function ClientMeasurements({ measurements }: { measurements: Measurement[] }) {
  const navigate = useNavigate()

  const navigateTo = (path: string) => {
    navigate(path)
  }

  if (measurements.length === 0) {
    return <p>Nenhuma avaliação registada.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='p-2'>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {measurements.map((measurement) => (
          <TableRow
            key={measurement.id}
            onClick={() => navigateTo(`/avaliacao/${measurement.id}`)}
          >
            <TableCell className='p-2'>
              {new Date(measurement.date).toLocaleDateString('pt-PT')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ClientMeasurements
