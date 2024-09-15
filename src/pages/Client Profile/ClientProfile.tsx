import { useParams } from 'react-router'
import axios from 'axios'
import { useState, useEffect } from 'react'

import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import {
  Client,
  Measurement,
  Schedule,
  Workout,
  Invoice,
  Subscription,
} from '@/utils/interfaces'

const emptyClient: Client = {
  id: '',
  firstname: '',
  lastname: '',
  join_date: '',
  birthday: '',
  goal: '',
  trainer_id: '',
  active: false,
  users: {
    id: '',
    email: '',
  },
}

const emptyMeasurement: Measurement[] = [
  {
    id: '',
    client_id: '',
    date: '',
    weight: 0,
    height: 0,
    body_fat_pct: 0,
    body_fat: 0,
    muscle_mass_pct: 0,
    muscle_mass: 0,
    water_pct: 0,
    bmi: 0,
    visceral_fat: 0,
    chest: 0,
    waist: 0,
    hip: 0,
    leftthigh: 0,
    rightthigh: 0,
    leftarm: 0,
    rightarm: 0,
    leftcalf: 0,
    rightcalf: 0,
  },
]

const emptyWorkout: Workout[] = [
  {
    id: '',
    name: '',
    active: true,
    public: false,
    workout_exercises: [
      {
        exercises: {
          id: '',
          name: '',
          description: '',
          equipment: {
            id: '',
            name: '',
          },
          bodyparts: {
            id: '',
            name: '',
          },
          media: [
            {
              id: '',
              type: '',
              url: '',
            },
          ],
        },
        reps: 20,
        sets: 6,
      },
    ],
  },
]

const emptyInvoice: Invoice[] = [
  {
    id: '',
    issue_date: '',
    due_date: '',
    amount: 0,
    status: '',
    subscriptions: {
      id: '',
      start_date: '',
      active: false,
      package_id: '',
      clients: {
        id: '',
        firstname: '',
        lastname: '',
        active: false,
      },
    },
  },
]

const emptySchedule: Schedule[] = [
  {
    id: '',
    date: '',
    time: '',
    clients: {
      id: '',
      firstname: '',
      lastname: '',
    },
  },
]

const emptySubscription: Subscription[] = [
  {
    id: '',
    start_date: '',
    active: false,
    packages: {
      id: '',
      name: '',
      price: 0,
      days_per_week: 0,
      active: false,
    },
  },
]

function ClientProfile() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { id } = useParams()
  const [client, setClient] = useState(emptyClient)
  const [measurements, setMeasurements] = useState(emptyMeasurement)
  const [invoices, setInvoices] = useState(emptyInvoice)
  const [workouts, setWorkouts] = useState(emptyWorkout)
  const [subscriptions, setSubscriptions] = useState(emptySubscription)
  const [schedules, setSchedules] = useState(emptySchedule)

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const [res1, res2, res3, res4, res5, res6] = await Promise.all([
          axios.get('http://localhost:3000/api/clients/' + id, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get('http://localhost:3000/api/measurements/client/' + id, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get('http://localhost:3000/api/invoices/client/' + id, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get('http://localhost:3000/api/workouts/client/' + id, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get('http://localhost:3000/api/subscriptions/client/' + id, {
            headers: {
              'Auth-Token': token,
            },
          }),
          axios.get('http://localhost:3000/api/schedule/client/' + id, {
            headers: {
              'Auth-Token': token,
            },
          }),
        ])

        const client = res1.data.client
        const measurements = res2.data.measurements
        const invoices = res3.data.invoices
        const workouts = res4.data.workouts
        const subscriptions = res5.data.subscriptions
        const schedules = res6.data.schedule

        setClient(client)
        setMeasurements(measurements)
        setInvoices(invoices)
        setWorkouts(workouts)
        setSubscriptions(subscriptions)
        setSchedules(schedules)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data)
          console.error(error.response?.status)
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    fetchClientInfo()
  }, [token, id])

  //TODO Create basic user profile and tabs for each section

  return <div>ClientProfile</div>
}

export default ClientProfile
