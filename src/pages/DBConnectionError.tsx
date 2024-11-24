import { Button } from '@/components/ui/button'

interface DBConnectionProps {
  checkConnection: () => void
}

function DBConnectionError(props: DBConnectionProps) {
  const { checkConnection } = props

  return (
    <div>
      <Button size='sm' onClick={checkConnection}>
        Tentar novamente
      </Button>
    </div>
  )
}

export default DBConnectionError
