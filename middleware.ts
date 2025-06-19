/*
 * =================================================================
 * FICHEIRO 3: O MIDDLEWARE (O SEGURANÇA)
 * Localização: /middleware.ts (na raiz do projeto)
 * =================================================================
 * Este ficheiro protege as nossas páginas.
 */
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de pedido, exceto os que começam com:
     * - api (rotas de API, exceto /api/auth)
     * - _next/static (ficheiros estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (o ícone do site)
     * - login (a nossa página de login)
     */
    "/((?!api/auth/signin|api/auth/session|api/auth/providers|api/auth/csrf|api/auth/callback|_next/static|_next/image|favicon.ico|login).*)",
  ],
};