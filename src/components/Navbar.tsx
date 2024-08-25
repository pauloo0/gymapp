import React from 'react'
import { MoveLeft, Menu, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'

function Navbar() {
  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const goBack = () => {
    window.history.back()
  }

  return (
    <div className='fixed top-0 left-0 flex flex-row items-center justify-between w-full px-6 pt-10'>
      {window.location.pathname !== '/' ? (
        <MoveLeft onClick={goBack} className={'w-7 h-7'} />
      ) : (
        <div></div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Menu className='w-7 h-7' />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My name</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link to={'/profile'}>Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to={'/workouts'}>Treinos</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to={'/measurements'}>Avaliações</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button onClick={logout} className='w-full rounded-sm' size={'sm'}>
              Terminar Sessão <LogOut className='w-5 h-5 ml-2' />
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Navbar
