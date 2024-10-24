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
  subscriptions: Subscription
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
  client_id: string
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
}

export interface Workout {
  id: string
  name: string
  active: boolean
  public: boolean
  workout_exercises: [
    {
      exercises: {
        id: string
        name: string
        description: string
        equipment: {
          id: string
          name: string
        }
        bodyparts: {
          id: string
          name: string
        }
        media: [
          {
            id: string
            type: string
            url: string
          }
        ]
      }
      reps: number
      sets: number
    }
  ]
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

export interface Package {
  id: string
  name: string
  price: number
  days_per_week: number
  active: boolean
}
