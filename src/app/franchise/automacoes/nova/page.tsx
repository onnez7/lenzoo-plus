import { AutomationForm } from "../_components/automation-form";

export default function NewAutomationPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Nova Automação de Pós-Venda</h1>
                <p className="text-muted-foreground">Crie uma nova mensagem automática para os seus clientes.</p>
            </div>
            <AutomationForm />
        </div>
    );
}