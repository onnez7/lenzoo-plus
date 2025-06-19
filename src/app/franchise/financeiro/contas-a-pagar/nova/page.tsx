import ExpenseForm from "../_components/expense-form";
export default function NewExpensePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Nova Despesa</h1>
            <ExpenseForm />
        </div>
    );
}