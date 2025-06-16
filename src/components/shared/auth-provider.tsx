/*
 * =================================================================
 * FICHEIRO 2: AUTH PROVIDER (Necessário para a sessão no cliente)
 * Localização: src/components/shared/auth-provider.tsx
 * =================================================================
 * Este é um componente do lado do cliente que envolve a aplicação
 * para que o `useSession` e `signOut` funcionem corretamente.
 */
'use client';
import { SessionProvider } from 'next-auth/react';

type Props = {
    children?: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}