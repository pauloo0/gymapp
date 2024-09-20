import { Measurement } from '@/utils/interfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

function ClientMeasurements({ measurements }: { measurements: Measurement[] }) {
  const navigateTo = (path: string) => {
    window.location.href = path
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {measurements.map((measurement) => (
          <TableRow>
            <TableCell
              key={measurement.id}
              onClick={() => navigateTo(`/avaliacoes/${measurement.id}`)}
              className='flex items-center justify-between cursor-pointer'
            >
              {new Date(measurement.date).toLocaleDateString('pt-PT')}
              <Button className='bg-transparent text-slate-400'>
                <ArrowRight />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ClientMeasurements
