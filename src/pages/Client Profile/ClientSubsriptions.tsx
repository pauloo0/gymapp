import { Subscription } from '@/utils/interfaces'

function ClientSubscriptions({
  subscriptions,
}: {
  subscriptions: Subscription[]
}) {
  return (
    <>
      {subscriptions.map((subscription) => (
        <div key={subscription.id}>{subscription.packages.name}</div>
      ))}
    </>
  )
}

export default ClientSubscriptions
