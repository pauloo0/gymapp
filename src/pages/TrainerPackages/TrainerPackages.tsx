import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Package } from '@/utils/interfaces'
import axios from 'axios'
import { useState, useEffect } from 'react'

import TrainerNavbar from '@/components/TrainerNavbar'
import Loading from '@/components/reusable/Loading'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

import { Plus, ArrowLeft } from 'lucide-react'
import { decimalToHoursMinutes } from '@/utils/functions'
import { useNavigate } from 'react-router'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function TrainerPackages() {
  const navigate = useNavigate()

  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    navigate('/login')
  }

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [packages, setPackages] = useState<Package[] | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(`${apiUrl}/packages`, {
          headers: {
            'Auth-Token': token,
          },
        })

        const packages: Package[] = res.data.packages
        setPackages(packages)
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

    fetchPackages()
  }, [token])

  if (isLoading) return <Loading />

  return (
    <>
      <TrainerNavbar />

      <main className='min-h-[calc(100vh_-_64px)]'>
        <div className='flex flex-row items-center justify-start w-full gap-2 mb-6'>
          <ArrowLeft className='w-6 h-6' onClick={() => navigate('/perfil')} />
          <h1 className='text-2xl font-semibold'>Os meus pacotes</h1>
        </div>

        <div className='flex flex-row items-center justify-between mb-4'>
          <Button
            type='button'
            variant='default'
            size='sm'
            onClick={() => navigate('/pacotes/novo')}
          >
            <Plus className='mr-1' /> Criar novo
          </Button>
        </div>

        <section id='package-list' className='overflow-y-auto max-h-[32rem]'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Dias p/mês</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages ? (
                packages.map((pkg: Package) => (
                  <TableRow
                    key={pkg.id}
                    onClick={() => navigate(`/pacote/${pkg.id}`)}
                    className='hover:bg-gray-900'
                  >
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell>{pkg.days_per_month}</TableCell>
                    <TableCell>{pkg.price} €</TableCell>
                    <TableCell>
                      {decimalToHoursMinutes(pkg.duration).timeString}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className='flex flex-col items-center justify-center hover:bg-gray-900'>
                  <p>Sem pacotes</p>
                  <Button onClick={() => navigate('/pacotes/novo')}>
                    <Plus className='mr-1' />
                    Adicionar
                  </Button>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
      </main>
    </>
  )
}

export default TrainerPackages
