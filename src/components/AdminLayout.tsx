import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

export default function AdminLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        setIsSidebarOpen(false)
    }, [location.pathname])

    const navItems = [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/produtos', label: 'Produtos' },
        { to: '/admin/produtos/novo', label: 'Novo Produto' },
        { to: '/', label: 'Ver Catálogo' },
    ]

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
            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Fechar menu lateral"
                    className="fixed inset-0 z-30 bg-gray-950/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-300 dark:bg-gray-800 lg:max-w-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="flex items-start justify-between border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                            Admin Panel
                        </h1>
                        <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                            {user?.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label="Fechar menu"
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={({ isActive }) => `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-gray-200 p-3 dark:border-gray-700 sm:p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <div className="min-h-screen lg:pl-72">
                <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
                    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                aria-label="Abrir menu lateral"
                                className="rounded-lg border border-gray-200 p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="min-w-0">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                                    Painel Administrativo
                                </h2>
                                <p className="truncate text-sm text-gray-600 dark:text-gray-400 lg:hidden">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/"
                            className="hidden rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 sm:inline-flex"
                        >
                            Ver catálogo
                        </Link>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
