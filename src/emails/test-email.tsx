import * as React from 'react';

interface TestEmailProps {
  userName: string;
}

export default function TestEmail({ userName }: TestEmailProps) {
  return (
    <div>
      <h1>Olá, {userName}!</h1>
      <p>Este é um email de teste da sua plataforma Lenzoo+.</p>
      <p>Se você recebeu esta mensagem, a sua integração com a API da Resend está a funcionar perfeitamente.</p>
      <p>Parabéns!</p>
    </div>
  );
}