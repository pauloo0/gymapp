import ListedSchedules from '@/components/dashboard/ListedSchedules'
import UnpaidInvoicesNextWeek from '@/components/dashboard/UnpaidInvoicesNextWeek'

function TrainerDashboard() {
  return (
    <div>
      <ListedSchedules />
      <UnpaidInvoicesNextWeek />
    </div>
  )
}

export default TrainerDashboard
