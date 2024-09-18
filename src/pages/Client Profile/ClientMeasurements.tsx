import { Measurement } from '@/utils/interfaces'

function ClientMeasurements({ measurements }: { measurements: Measurement[] }) {
  return (
    <>
      {measurements.map((measurement) => (
        <div key={measurement.id}>{measurement.date}</div>
      ))}
    </>
  )
}

export default ClientMeasurements
