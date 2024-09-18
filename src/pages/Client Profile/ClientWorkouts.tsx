import { Workout } from '@/utils/interfaces'

function ClientWorkouts({ workouts }: { workouts: Workout[] }) {
  return (
    <>
      {workouts.map((workout) => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </>
  )
}

export default ClientWorkouts
