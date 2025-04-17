import { Button } from '@/components/ui/button'

function NotFound() {
  return (
    <main className='flex items-center justify-center min-h-screen'>
      <div className='flex flex-col gap-6 w-96'>
        <h1 className='text-2xl font-bold text-center'>
          Erro 404 - Página não encontrada.
        </h1>
        <Button
          type='button'
          variant={'secondary'}
          className='w-full'
          onClick={() => window.history.back()}
        >
          Voltar
        </Button>
      </div>
    </main>
  )
}

export default NotFound
