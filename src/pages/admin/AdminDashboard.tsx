import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Stats {
    totalProducts: number
    activeProducts: number
    inactiveProducts: number
    categories: { [key: string]: number }
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        categories: {},
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            // Buscar todos os produtos
            const { data: products, error } = await supabase
                .from('products')
                .select('id, active, category')

            if (error) throw error

            const total = products?.length || 0
            const active = products?.filter(p => p.active).length || 0
            const inactive = total - active

            // Contar por categoria
            const categoryCounts: { [key: string]: number } = {}
            products?.forEach(p => {
                categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
            })

            setStats({
                totalProducts: total,
                activeProducts: active,
                inactiveProducts: inactive,
                categories: categoryCounts,
            })
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Visão geral do catálogo de produtos
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Total de Produtos
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stats.totalProducts}
                            </p>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Produtos Ativos
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stats.activeProducts}
                            </p>
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Produtos Inativos
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stats.inactiveProducts}
                            </p>
                        </div>
                        <div className="text-red-600 dark:text-red-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Categorias
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {Object.keys(stats.categories).length}
                            </p>
                        </div>
                        <div className="text-purple-600 dark:text-purple-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories List */}
            {Object.keys(stats.categories).length > 0 && (
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Produtos por Categoria
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(stats.categories)
                            .sort((a, b) => b[1] - a[1])
                            .map(([category, count]) => (
                                <div key={category} className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {category}
                                    </span>
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                                        {count} {count === 1 ? 'produto' : 'produtos'}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Ações Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/admin/produtos/novo"
                        className="btn-primary text-center"
                    >
                        + Novo Produto
                    </Link>
                    <Link
                        to="/admin/produtos"
                        className="btn-secondary text-center"
                    >
                        Ver Todos os Produtos
                    </Link>
                    <Link
                        to="/"
                        className="btn-secondary text-center"
                    >
                        Ver Catálogo Público
                    </Link>
                </div>
            </div>
        </div>
    )
}
