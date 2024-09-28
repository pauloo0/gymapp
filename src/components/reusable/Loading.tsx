import { LoaderCircle } from 'lucide-react'

function Loading() {
  return (
    <div className='absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-slate-700'>
      <LoaderCircle className='w-12 h-12 animate-spin' /> A carregar...
    </div>
  )
}

export default Loading
