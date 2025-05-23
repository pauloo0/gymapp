export interface Client {
  id: string
  firstname: string
  lastname: string
  gender: string
  phone_number: string
  join_date: string
  birthday: string
  goal: string
  trainer_id: string
  active: boolean
  injuries: string
  health_conditions: string
  users: {
    id: string
    email: string
  }
  client_locations: ClientLocation
  subscriptions: Subscription[]
}

export interface ClientLocation {
  id: string
  trainer_id: string
  location: string
  color_hex: string
  associatedClients: number
}

type ScheduleStatus = 'scheduled' | 'completed' | 'canceled'
type ScheduleRepeatType = 'no_repeat' | 'weekly' | 'biweekly' | 'monthly'
export interface Schedule {
  id: string
  date: string
  time: string
  status: ScheduleStatus
  repeating?: boolean
  repeat_type?: ScheduleRepeatType
  originel_schedule_id?: string
  workouts: Workout | null
  clients: {
    id: string
    firstname: string
    lastname: string
    client_locations: {
      id: string
      location: string
      color_hex: string
    }
    subscriptions: {
      id: string
      packages: {
        id: string
        name: string
        days_per_month: number
        duration: number
      }
    }
  }
}

export interface Measurement {
  id: string
  date: string
  weight: number
  height: number
  body_fat_pct: number
  body_fat: number
  muscle_mass_pct: number
  muscle_mass: number
  water_pct: number
  bmi: number
  visceral_fat: number
  chest: number
  waist: number
  hip: number
  leftthigh: number
  rightthigh: number
  leftarm: number
  rightarm: number
  leftcalf: number
  rightcalf: number
  clients: {
    id: string
    firstname: string
    lastname: string
  }
}

type WorkoutType = 'regular' | 'power_test' | 'one_rm_test'

export interface Workout {
  id: string
  name: string
  active: boolean
  public: boolean
  type: WorkoutType
  notes: string
  clients: {
    id: string
    firstname: string
    lastname: string
  }
  workout_exercises: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  exercises: Exercise
  order: number
  rest_after_exercise: number
  sets: Set[]
}

export interface Set {
  id: string
  set_number: number
  reps?: number
  weight?: number
  time?: number
  distance?: number
  is_failure: boolean
  rest_after_set: number
}

export interface Subscription {
  id: string
  start_date: string
  active: boolean
  packages: Package
}

export interface Invoice {
  id: string
  issue_date: string
  due_date: string
  amount: number
  status: string
  subscriptions: {
    id: string
    start_date: string
    active: boolean
    package_id: string
    clients: {
      id: string
      firstname: string
      lastname: string
      active: boolean
    }
  }
}

export interface Payment {
  id: string
  payment_date: string
  amount: number
  cancelled: boolean
}

export interface Package {
  id: string
  name: string
  price: number
  duration: number
  days_per_month: number
  active: boolean
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export interface Exercise {
  id: string
  name: string
  description?: string
  difficulty_level: DifficultyLevel
  media: {
    id: string
    type: string
    url: string
  }[]
  bodyparts: {
    id: string
    name: string
  }
  equipment: {
    id: string
    name: string
  }
  exercise_measurements: ExerciseMeasurement[]
}

export type MeasurementType = 'reps' | 'weight' | 'time' | 'distance'
export interface ExerciseMeasurement {
  id: string
  measurement_type: MeasurementType
  is_required: boolean
}

export interface Bodypart {
  id: string
  name: string
}

export interface Equipment {
  id: string
  name: string
}

export interface User {
  id: string
  username: string
  email: string
  clients?: [
    {
      id: string
      firstname: string
      lastname: string
      gender: string
      phone_number: string
      join_date: string
      birthday: string
      goal: string
      active: boolean
      trainer_id: string
    }
  ]
  trainers?: [
    {
      id: string
      firstname: string
      lastname: string
    }
  ]
}
