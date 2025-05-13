import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function UnderConstruction() {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col items-center justify-center gap-8'>
      <h1 className='text-xl'>Esta página ainda não está pronta.</h1>
      <Button
        variant={'default'}
        className='w-full'
        onClick={() => navigate(-1)}
      >
        Voltar
      </Button>
    </div>
  )
}
