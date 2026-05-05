import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Stats {
    totalProducts: number
    activeProducts: number
    inactiveProducts: number
    categories: { [key: string]: number }
}

interface AnalyticsStats {
    totalClicks: number
    clicksToday: number
    clicksWeek: number
    topProduct: {
        name: string
        clicks: number
    } | null
    productClicks: Array<{
        id: string
        name: string
        category: string
        total_clicks: number
        clicks_today: number
        clicks_week: number
    }>
}

interface ProductStatsRow {
    id: string
    active: boolean
    category: string
}

interface AnalyticsSummaryRow {
    id: string
    name: string
    category: string
    total_clicks: number | null
    clicks_today: number | null
    clicks_week: number | null
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        categories: {},
    })
    const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats>({
        totalClicks: 0,
        clicksToday: 0,
        clicksWeek: 0,
        topProduct: null,
        productClicks: []
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchStats()
        fetchAnalytics()
    }, [])

    const fetchStats = async () => {
        try {
            // Buscar todos os produtos
            const { data: products, error } = await (
                supabase
                    .from('products' as never)
                    .select('id, active, category') as unknown as Promise<{ data: ProductStatsRow[] | null; error: Error | null }>
            )

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

    const fetchAnalytics = async () => {
        try {
            // Buscar resumo de analytics usando a view
            const { data: analyticsData, error } = await (
                supabase
                    .from('product_analytics_summary' as never)
                    .select('*')
                    .order('total_clicks', { ascending: false }) as unknown as Promise<{ data: AnalyticsSummaryRow[] | null; error: Error | null }>
            )

            if (error) throw error

            if (analyticsData && analyticsData.length > 0) {
                // Calcular totais
                const totalClicks = analyticsData.reduce((sum, p) => sum + (p.total_clicks || 0), 0)
                const clicksToday = analyticsData.reduce((sum, p) => sum + (p.clicks_today || 0), 0)
                const clicksWeek = analyticsData.reduce((sum, p) => sum + (p.clicks_week || 0), 0)

                // Produto com mais cliques
                const topClicks = analyticsData[0].total_clicks ?? 0
                const topProduct = topClicks > 0
                    ? {
                        name: analyticsData[0].name,
                        clicks: topClicks
                    }
                    : null

                setAnalyticsStats({
                    totalClicks,
                    clicksToday,
                    clicksWeek,
                    topProduct,
                    productClicks: analyticsData.slice(0, 5).map(p => ({
                        id: p.id,
                        name: p.name,
                        category: p.category,
                        total_clicks: p.total_clicks || 0,
                        clicks_today: p.clicks_today || 0,
                        clicks_week: p.clicks_week || 0
                    }))
                })
            }
        } catch (error) {
            console.error('Erro ao carregar analytics:', error)
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
        <div className="space-y-5 sm:space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
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

            {/* Analytics Stats Cards */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Métricas de Interesse
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    <div className="card bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Total de Contatos
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                    {analyticsStats.totalClicks}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Cliques no WhatsApp
                                </p>
                            </div>
                            <div className="ml-4 shrink-0 text-green-600 dark:text-green-400">
                                <svg className="h-10 w-10 sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Contatos Hoje
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                    {analyticsStats.clicksToday}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Últimas 24 horas
                                </p>
                            </div>
                            <div className="ml-4 shrink-0 text-blue-600 dark:text-blue-400">
                                <svg className="h-10 w-10 sm:h-12 sm:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Contatos na Semana
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                    {analyticsStats.clicksWeek}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Últimos 7 dias
                                </p>
                            </div>
                            <div className="ml-4 shrink-0 text-purple-600 dark:text-purple-400">
                                <svg className="h-10 w-10 sm:h-12 sm:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Produto Mais Buscado
                                </p>
                                {analyticsStats.topProduct ? (
                                    <>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-2 truncate">
                                            {analyticsStats.topProduct.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {analyticsStats.topProduct.clicks} contatos
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-lg text-gray-500 dark:text-gray-500 mt-2">
                                        Nenhum ainda
                                    </p>
                                )}
                            </div>
                            <div className="ml-4 shrink-0 text-yellow-600 dark:text-yellow-400">
                                <svg className="h-10 w-10 sm:h-12 sm:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products by Interest */}
            {analyticsStats.productClicks.length > 0 && (
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Top 5 Produtos com Mais Interesse
                    </h2>
                    <div className="space-y-3 md:hidden">
                        {analyticsStats.productClicks.map((product, index) => (
                            <article key={product.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                                        {index + 1}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                            {product.name}
                                        </h3>
                                        <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {product.category}
                                        </span>

                                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-xl bg-green-50 px-3 py-2 dark:bg-green-900/20">
                                                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</p>
                                                <p className="mt-1 text-base font-bold text-green-600 dark:text-green-400">{product.total_clicks}</p>
                                            </div>
                                            <div className="rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                                                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Hoje</p>
                                                <p className="mt-1 text-base font-bold text-blue-600 dark:text-blue-400">{product.clicks_today}</p>
                                            </div>
                                            <div className="rounded-xl bg-purple-50 px-3 py-2 dark:bg-purple-900/20">
                                                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">7 dias</p>
                                                <p className="mt-1 text-base font-bold text-purple-600 dark:text-purple-400">{product.clicks_week}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Produto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Categoria
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Hoje
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        7 Dias
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                {analyticsStats.productClicks.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
                                                    {index + 1}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {product.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {product.total_clicks}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {product.clicks_today}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                {product.clicks_week}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                                <div key={category} className="flex flex-col gap-2 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base">
                                        {category}
                                    </span>
                                    <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
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
