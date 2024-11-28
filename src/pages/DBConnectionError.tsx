import { Button } from '@/components/ui/button'

interface DBConnectionProps {
  checkConnection: () => void
}

function DBConnectionError(props: DBConnectionProps) {
  const { checkConnection } = props

  return (
    <div className='flex flex-col items-center justify-center h-screen mx-4 space-y-12 overflow-hidden'>
      <h1 className='text-xl font-bold text-center'>
        Não consegui estabelecer conexão com a base de dados.
        <br />
        Tente novamente mais tarde.
      </h1>
      <Button onClick={checkConnection} size={'lg'} className='py-6 text-lg'>
        Tentar novamente
      </Button>
    </div>
  )
}

export default DBConnectionError
