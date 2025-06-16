/*
 * =================================================================
 * FICHEIRO 3: O LAYOUT DE AUTENTICAÇÃO (Para a página de login)
 * Localização: src/app/(auth)/layout.tsx
 * =================================================================
 * Este layout simples envolve apenas as páginas dentro de (auth),
 * como /login. Ele garante que elas tenham um fundo limpo
 * e não mostrem o menu lateral do painel principal.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {children}
    </div>
  );
}