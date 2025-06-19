import FranchiseForm from "../_components/franchise-form";

export default function NewFranchisePage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Adicionar Nova Franquia</h1>
                <p className="text-muted-foreground">Preencha os dados abaixo para registar uma nova loja na rede.</p>
            </div>
            <FranchiseForm />
        </div>
    )
}