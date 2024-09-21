import { Measurement } from '@/utils/interfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function ClientMeasurements({ measurements }: { measurements: Measurement[] }) {
  const navigateTo = (path: string) => {
    window.location.href = path
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
            onClick={() => navigateTo(`/avaliacoes/${measurement.id}`)}
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
