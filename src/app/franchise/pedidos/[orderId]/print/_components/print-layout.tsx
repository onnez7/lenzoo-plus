'use client'

import { useEffect } from 'react';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  // O hook useEffect é executado apenas no lado do cliente (no navegador).
  useEffect(() => {
    // Aciona a função de impressão do navegador.
    window.print();
  }, []); // O array vazio [] garante que isto só é executado uma vez.

  return <>{children}</>;
}