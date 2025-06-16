/*
 * =================================================================
 * FICHEIRO 2: A SIDEBAR (O menu de navegação)
 * Localização: src/components/shared/sidebar.tsx
 * =================================================================
 * Este componente é o menu lateral. Ele recebe os dados do utilizador
 * para, no futuro, mostrar/ocultar itens de menu com base no seu papel.
 */
import Link from "next/link";
import { Home, Users, Package, ShoppingCart, FileText, Settings, User } from "lucide-react";
// NOTA: Para os ícones, certifique-se que tem 'lucide-react' instalado.

// Tipifica os dados do utilizador que a Sidebar espera receber.
type UserSession = {
    name?: string | null;
    email?: string | null;
    role?: string | null;
}

const Sidebar = ({ user }: { user: UserSession }) => {
    // Lógica para decidir quais links mostrar com base no papel (role) do utilizador.
    // O 'franchise_admin' vê mais itens que o 'employee'.
    const isAdmin = user.role === 'franchise_admin';

    return (
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
            <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
                <h1 className="text-2xl font-bold text-blue-600">Lenzoo+</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                    <Home className="w-5 h-5" />
                    <span className="ml-3">Dashboard</span>
                </Link>
                <Link href="/clientes" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                    <Users className="w-5 h-5" />
                    <span className="ml-3">Clientes</span>
                </Link>
                <Link href="/pedidos" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="ml-3">Pedidos / OS</span>
                </Link>
                <Link href="/estoque" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                    <Package className="w-5 h-5" />
                    <span className="ml-3">Estoque</span>
                </Link>

                {/* Itens de menu visíveis apenas para o admin da franquia */}
                {isAdmin && (
                    <>
                        <hr className="my-2 border-gray-200 dark:border-gray-600"/>
                        <p className="px-4 pt-2 text-xs font-semibold text-gray-400 uppercase">Admin</p>
                        <Link href="/relatorios" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                            <FileText className="w-5 h-5" />
                            <span className="ml-3">Relatórios</span>
                        </Link>
                         <Link href="/usuarios" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                            <User className="w-5 h-5" />
                            <span className="ml-3">Colaboradores</span>
                        </Link>
                        <Link href="/configuracoes" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                            <Settings className="w-5 h-5" />
                            <span className="ml-3">Configurações</span>
                        </Link>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;