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
        {
            to: '/admin',
            label: 'Dashboard',
            description: 'Pulso comercial e interesse',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13h6V5H4v8zm10 6h6V5h-6v14zM4 19h6v-2H4v2zm10-8h6v-2h-6v2z" />
                </svg>
            ),
        },
        {
            to: '/admin/produtos',
            label: 'Produtos',
            description: 'Curadoria, status e revisão',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
        {
            to: '/admin/produtos/novo',
            label: 'Novo Produto',
            description: 'Cadastro guiado e comercial',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
        },
        {
            to: '/',
            label: 'Ver Catálogo',
            description: 'Experiência pública do cliente',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                </svg>
            ),
        },
    ]

    const currentSection = navItems.find((item) => item.to !== '/' && (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)))

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
        <div className="admin-shell min-h-screen">
            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Fechar menu lateral"
                    className="fixed inset-0 z-30 bg-gray-950/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col transition-transform duration-300 lg:max-w-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="flex items-start justify-between border-b border-white/10 p-5 sm:p-6">
                    <div className="min-w-0 flex-1">
                        <div className="admin-sidebar-panel rounded-[28px] p-5 sm:p-6">
                            <span className="admin-sidebar-chip">
                                Operação premium
                            </span>

                            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white shadow-lg">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a4 4 0 00-5.656 0M6.343 6.343a8 8 0 0111.314 0M8.464 8.464a5 5 0 017.072 0M12 20h.01" />
                                </svg>
                            </div>

                            <h1 className="mt-5 text-2xl font-semibold text-white sm:text-[1.85rem]">
                                Painel comercial
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-white/68">
                                Produtos, performance e atendimento em uma visão pensada para apresentar valor ao cliente final.
                            </p>

                            <div className="admin-sidebar-panel mt-5 rounded-2xl px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                                    Sessão ativa
                                </p>
                                <p className="mt-2 truncate text-sm font-medium text-white/88">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-label="Fechar menu"
                        className="rounded-xl p-2 text-white/72 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5 sm:px-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-item-active' : ''}`}
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90">
                                {item.icon}
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold">
                                    {item.label}
                                </span>
                                <span className="mt-1 block text-xs text-white/52">
                                    {item.description}
                                </span>
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-3 sm:p-4">
                    <button
                        onClick={handleLogout}
                        className="admin-button-ghost w-full"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <div className="min-h-screen lg:pl-72">
                <header className="admin-header sticky top-0 z-20 shadow-sm">
                    <div className="admin-page flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                aria-label="Abrir menu lateral"
                                className="rounded-xl border border-[color:var(--admin-line)] bg-white/70 p-2 text-[color:var(--admin-obsidian)] transition-colors hover:bg-white lg:hidden"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="min-w-0">
                                <p className="admin-kicker">
                                    Backoffice do catálogo
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-[color:var(--admin-obsidian)] sm:text-2xl lg:text-3xl">
                                    {currentSection?.label ?? 'Painel Administrativo'}
                                </h2>
                                <p className="mt-1 truncate text-sm admin-subtle-text">
                                    {currentSection?.description ?? 'Gestão visual, comercial e operacional do catálogo.'}
                                </p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-3 lg:flex">
                            <span className="admin-badge admin-badge-light">
                                Conversão via WhatsApp
                            </span>
                            <Link
                                to="/"
                                className="admin-button-secondary"
                            >
                                Ver catálogo
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="admin-page">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
