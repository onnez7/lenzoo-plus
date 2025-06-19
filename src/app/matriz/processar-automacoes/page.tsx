import { ProcessAutomationsClient } from "./_components/process-automations-client";

export default function ProcessAutomationsPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Processar Automações</h1>
                <p className="text-muted-foreground">
                    Esta página simula um serviço de fundo ("cron job") que verifica e envia mensagens pendentes.
                </p>
            </div>
            <ProcessAutomationsClient />
        </div>
    );
}