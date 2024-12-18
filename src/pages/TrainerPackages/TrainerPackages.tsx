import { useToken } from '@/utils/tokenWrapper'
import { useUser } from '@/utils/userWrapper'
import { Package } from '@/utils/interfaces'
import axios from 'axios'
import { useState, useEffect } from 'react'

import Navbar from '@/components/Navbar'
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

import { Plus } from 'lucide-react'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

function TrainerPackages() {
  const token = useToken()
  const user = useUser()

  if (!token || !user) {
    window.location.href = '/login'
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
      <Navbar />
      <h1 className='mb-6 text-2xl'>Os meus pacotes</h1>

      <div className='flex flex-row items-center justify-between my-4'>
        <Button
          type='button'
          variant='default'
          size='sm'
          onClick={() => (window.location.href = '/pacotes/novo')}
        >
          <Plus className='mr-1' /> Criar novo
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Dias p/semana</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages ? (
            packages.map((pkg: Package) => (
              <TableRow
                key={pkg.id}
                onClick={() => (window.location.href = `/pacote/${pkg.id}`)}
              >
                <TableCell>{pkg.name}</TableCell>
                <TableCell>{pkg.price} €</TableCell>
                <TableCell className='text-center'>
                  {pkg.days_per_week}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className='flex flex-col items-center justify-c'>
              <p>Sem pacotes</p>
              <Button onClick={() => (window.location.href = '/pacotes/novo')}>
                <Plus className='mr-1' />
                Adicionar
              </Button>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}

export default TrainerPackages
