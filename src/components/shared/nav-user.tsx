'use client'

import { BellIcon, CreditCardIcon, LogOutIcon, UserCircleIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { cn } from '@/lib/utils'
import { UserRole } from "@prisma/client"

type UserSession = { 
  name?: string | null; 
  email?: string | null; 
  role?: string | null; 
  franchiseId?: string | null; 
  labId?: string | null; 
};

export function NavUser({ user }: { user: UserSession }) {
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const isMatriz = user.role === UserRole.MATRIZ_ADMIN;
  const isFranchiseAdmin = user.role === UserRole.FRANCHISE_ADMIN; // Corrigido de FRANQUIZADO_ADMIN
  const isFranchiseUser = user.role === UserRole.EMPLOYEE; // Corrigido de FRANQUIZADO_COLABORADOR
  const isLabUser = user.role === UserRole.LAB_USER;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 p-2 text-left h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt={user.name || 'Usuário'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className={cn("grid flex-1 text-sm leading-tight group-data-[collapsed=true]/sidebar:hidden")}>
            <span className="truncate font-semibold">{user.name || 'Usuário'}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email || 'Sem email'}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src="/placeholder-user.jpg" alt={user.name || 'Usuário'} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name || 'Usuário'}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email || 'Sem email'}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserCircleIcon className="mr-2 h-4 w-4" />
            <span>Conta</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon className="mr-2 h-4 w-4" />
            <span>Notificações</span>
          </DropdownMenuItem>
          {/* Item de menu visível apenas para FRANCHISE_ADMIN */}
          {isFranchiseAdmin && (
            <DropdownMenuItem>
              <CreditCardIcon className="mr-2 h-4 w-4" />
              <span>Plano e Faturação</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}