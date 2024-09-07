import ListedSchedules from '@/components/dashboard/ListedSchedules'
import UnpaidInvoicesNextWeek from '@/components/dashboard/UnpaidInvoicesNextWeek'

function TrainerDashboard() {
  return (
    <div className='flex flex-col gap-4'>
      <ListedSchedules />
      <UnpaidInvoicesNextWeek />
    </div>
  )
}

export default TrainerDashboard
