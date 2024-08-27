import { useToken } from '@/utils/tokenWrapper'

import axios from 'axios'
import { useState, useEffect } from 'react'

interface Schedule {
  id: string
  date: string
  time: string
  clients: {
    id: string
    firstname: string
    lastname: string
  }
}

const emptySchedules: Schedule[] = [
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

function ListedSchedules() {
  const token = useToken()

  const [schedules, setSchedules] = useState<Schedule[]>(emptySchedules)

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/schedule', {
        headers: {
          'Auth-Token': token,
        },
      })

      const sortedSchedules = res.data.schedule
        .filter(
          (schedule: Schedule) =>
            schedule.date ===
            new Date(new Date().setHours(1, 0, 0, 0)).toISOString()
        )
        .sort((scheduleA: Schedule, scheduleB: Schedule) => {
          const dateA = new Date(scheduleA.date)
          const dateB = new Date(scheduleB.date)
          const timeA = new Date(`1970-01-01T${scheduleA.time}`)
          const timeB = new Date(`1970-01-01T${scheduleB.time}`)
          return (
            dateA.getTime() - dateB.getTime() ||
            timeA.getTime() - timeB.getTime()
          )
        })

      setSchedules(sortedSchedules)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.status)
        console.log(error.response?.data)
      } else {
        console.error('An unexpected error occurred:', error)
      }
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  return (
    <div>
      {schedules.map((schedule: Schedule) => (
        <div key={schedule.id}>
          {schedule.clients.firstname + ' ' + schedule.clients.lastname}
          <div>
            {new Date(schedule.date).toLocaleDateString()} - {schedule.time}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ListedSchedules
