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
  users: {
    id: string
    email: string
  }
  subscriptions: Subscription[]
}

export interface Schedule {
  id: string
  date: string
  time: string
  clients: {
    id: string
    firstname: string
    lastname: string
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

export interface Workout {
  id: string
  name: string
  active: boolean
  public: boolean
  is_power_test: boolean
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
  sets: Set[]
}

export interface Set {
  id: string
  set_number: number
  reps: number
  weight: number
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

export interface Exercise {
  id: string
  name: string
  description?: string
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
