import { Link, useNavigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

export default function AdminLayout() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Erro ao fazer logout')
        } else {
            toast.success('Logout realizado com sucesso')
            navigate('/login')
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin Panel
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {user?.email}
                    </p>
                </div>

                <nav className="mt-6">
                    <Link
                        to="/admin"
                        className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="ml-3">Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/produtos"
                        className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="ml-3">Produtos</span>
                    </Link>

                    <Link
                        to="/admin/produtos/novo"
                        className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="ml-3">Novo Produto</span>
                    </Link>

                    <Link
                        to="/"
                        className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="ml-3">Ver Catálogo</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="ml-3">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="ml-64">
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="px-8 py-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Painel Administrativo
                        </h2>
                    </div>
                </header>

                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
