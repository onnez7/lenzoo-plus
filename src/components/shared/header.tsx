/*
 * =================================================================
 * FICHEIRO 3: O HEADER (O cabeçalho com perfil do utilizador)
 * Localização: src/components/shared/header.tsx
 * =================================================================
 * Este componente é o cabeçalho superior, mostrando o nome do utilizador
 * e um menu para fazer logout.
 */
'use client'; // Necessário para o menu dropdown e o botão de logout
import { LogOut, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// NOTA: Para isto funcionar, instale os componentes do Shadcn/UI:
// npx shadcn-ui@latest add dropdown-menu avatar button

type UserSession = {
    name?: string | null;
    email?: string | null;
}

const Header = ({ user }: { user: UserSession }) => {
    // Pega as iniciais do nome do utilizador para o avatar de fallback.
    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <header className="flex items-center justify-end h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarImage src="/avatar.png" alt="Avatar" />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};

export default Header;