import { Schedule } from '@/utils/interfaces'

function ClientSchedules({ schedules }: { schedules: Schedule[] }) {
  return (
    <>
      {schedules.map((schedule) => (
        <div key={schedule.id}>
          {schedule.date} - {schedule.time}
        </div>
      ))}
    </>
  )
}

export default ClientSchedules
