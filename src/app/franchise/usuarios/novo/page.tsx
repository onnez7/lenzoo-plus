/*
 * =================================================================
 * FICHEIRO 4 e 5: PÁGINAS DE CRIAÇÃO E EDIÇÃO
 * Localização:
 * src/app/(franchise)/usuarios/novo/page.tsx
 * src/app/(franchise)/usuarios/[userId]/page.tsx
 * =================================================================
 */
// FICHEIRO para: src/app/(franchise)/usuarios/novo/page.tsx
import UserForm from "@/app/franchise/usuarios/_components/user-form";
export default function NewUserPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Adicionar Novo Colaborador</h1>
            <UserForm />
        </div>
    );
}