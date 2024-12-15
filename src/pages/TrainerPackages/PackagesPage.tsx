import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Package } from '@/utils/interfaces'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router'

import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

import Navbar from '@/components/Navbar'
import Loading from '@/components/reusable/Loading'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function PackagesPage() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
  }

  const { package_id } = useParams()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null)

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(`${apiUrl}/packages/${package_id}`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const pkg: Package = res.data.package
        setCurrentPackage(pkg)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status)
          console.error(error.response?.data)
        } else {
          console.error('An unexpected error occurred.', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackage()
  }, [token, package_id])

  const editPackage = (pkg: Package) => {
    window.location.href = `/pacote/${pkg.id}/editar`
  }

  if (isLoading) return <Loading />

  if (!currentPackage) {
    window.location.href = '/pacotes'
  } else {
    return (
      <>
        <Navbar />
        <div className='flex flex-row items-center justify-between w-full gap-2'>
          <ArrowLeft
            className='w-6 h-6'
            onClick={() => (window.location.href = '/pacotes')}
          />
        </div>

        <div
          id='package-header'
          className='flex flex-row items-center justify-end w-full mt-10 mb-12'
          onClick={() => editPackage(currentPackage)}
        >
          <Button
            size={'sm'}
            className='flex flex-row items-center justify-center gap-1 px-3 transition-colors duration-200 bg-amber-400 text-slate-900 hover:bg-amber-500'
          >
            <Pencil className='w-4 h-4' /> Editar
          </Button>
        </div>

        <div
          id='package-info'
          className='flex flex-col items-start justify-center gap-2'
        >
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Nome</h2>
            {currentPackage.name}
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Preço</h2>
            {currentPackage.price} €
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Dias por semana</h2>
            {currentPackage.days_per_week}
          </div>
          <div className='flex flex-col items-start justify-center'>
            <h2 className='text-lg font-semibold'>Ativo</h2>
            {currentPackage.active ? 'Sim' : 'Não'}
          </div>
        </div>
      </>
    )
  }
}

export default PackagesPage
