import { LoaderCircle } from 'lucide-react'

function Loading() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-gray-50 bg-gray-950'>
      <LoaderCircle className='w-12 h-12 animate-spin' /> A carregar...
    </div>
  )
}

export default Loading
