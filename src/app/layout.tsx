/*
 * =================================================================
 * FICHEIRO 1: O ROOT LAYOUT (O ficheiro mais importante)
 * Localização: src/app/layout.tsx
 * =================================================================
 * Este ficheiro envolve TODA a aplicação. Ele precisa de definir
 * as tags <html> e <body> e carregar os estilos globais. Um erro
 * aqui pode quebrar todas as páginas.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/shared/auth-provider";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lenzoo+",
  description: "Sistema de gestão para óticas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* O AuthProvider disponibiliza os dados da sessão para os componentes do lado do cliente */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
