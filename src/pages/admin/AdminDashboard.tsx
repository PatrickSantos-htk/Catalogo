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

    const formatMetric = (value: number) => value.toLocaleString('pt-BR')
    const categoryEntries = Object.entries(stats.categories).sort((a, b) => b[1] - a[1])
    const leadingCategory = categoryEntries[0]
    const activeRate = stats.totalProducts > 0
        ? Math.round((stats.activeProducts / stats.totalProducts) * 100)
        : 0

    const inventoryCards = [
        {
            label: 'Total de produtos',
            value: formatMetric(stats.totalProducts),
            note: 'Base completa publicada no catalogo',
            variant: 'admin-stat-card--bronze',
            iconVariant: 'admin-stat-icon--dark',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
        {
            label: 'Produtos ativos',
            value: formatMetric(stats.activeProducts),
            note: `${activeRate}% da base pronta para o cliente`,
            variant: 'admin-stat-card--emerald',
            iconVariant: 'admin-stat-icon--emerald',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: 'Produtos inativos',
            value: formatMetric(stats.inactiveProducts),
            note: 'Itens que ainda precisam de revisao ou aprovacao',
            variant: 'admin-stat-card--rose',
            iconVariant: 'admin-stat-icon--rose',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
        },
        {
            label: 'Categorias ativas',
            value: formatMetric(categoryEntries.length),
            note: leadingCategory ? `${leadingCategory[0]} lidera com ${leadingCategory[1]} itens` : 'Sem categorias mapeadas ainda',
            variant: 'admin-stat-card--violet',
            iconVariant: 'admin-stat-icon--violet',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
        },
    ]

    const interestCards = [
        {
            label: 'Total de contatos',
            value: formatMetric(analyticsStats.totalClicks),
            note: 'Cliques enviados para o WhatsApp',
            variant: 'admin-stat-card--emerald',
            iconVariant: 'admin-stat-icon--dark',
            icon: (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            ),
        },
        {
            label: 'Contatos hoje',
            value: formatMetric(analyticsStats.clicksToday),
            note: 'Janela das ultimas 24 horas',
            variant: 'admin-stat-card--info',
            iconVariant: 'admin-stat-icon--info',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: 'Contatos na semana',
            value: formatMetric(analyticsStats.clicksWeek),
            note: 'Leitura dos ultimos 7 dias',
            variant: 'admin-stat-card--violet',
            iconVariant: 'admin-stat-icon--violet',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            label: 'Produto lider',
            value: analyticsStats.topProduct ? analyticsStats.topProduct.name : 'Nenhum ainda',
            note: analyticsStats.topProduct ? `${formatMetric(analyticsStats.topProduct.clicks)} contatos acumulados` : 'O ranking aparece assim que houver interesse do cliente',
            variant: 'admin-stat-card--warning',
            iconVariant: 'admin-stat-icon--warning',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <section className="admin-hero p-6 sm:p-8 lg:p-10">
                <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
                    <div>
                        <span className="admin-badge admin-badge-dark">
                            Operacao comercial do catalogo
                        </span>

                        <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl xl:text-5xl">
                            Um admin que transmite controle, criterio e atencao ao cliente.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                            A leitura agora destaca saude do catalogo, resposta comercial e o que esta puxando interesse real no WhatsApp.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <div className="admin-hero-panel p-4 sm:p-5">
                                <p className="admin-kicker admin-kicker-on-dark">Base ativa</p>
                                <p className="mt-3 text-3xl font-semibold text-white">
                                    {activeRate}%
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/66">
                                    Produtos disponiveis e prontos para venda consultiva.
                                </p>
                            </div>

                            <div className="admin-hero-panel p-4 sm:p-5">
                                <p className="admin-kicker admin-kicker-on-dark">Contatos gerados</p>
                                <p className="mt-3 text-3xl font-semibold text-white">
                                    {formatMetric(analyticsStats.totalClicks)}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/66">
                                    Cliques no canal principal de conversao do negocio.
                                </p>
                            </div>

                            <div className="admin-hero-panel p-4 sm:p-5">
                                <p className="admin-kicker admin-kicker-on-dark">Categoria lider</p>
                                <p className="mt-3 text-2xl font-semibold text-white">
                                    {leadingCategory?.[0] ?? 'Aguardando dados'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/66">
                                    {leadingCategory ? `${formatMetric(leadingCategory[1])} itens concentram mais presenca no catalogo.` : 'Assim que houver produtos categorizados, o destaque aparece aqui.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-hero-panel p-5 sm:p-6">
                        <p className="admin-kicker admin-kicker-on-dark">Sinal mais forte da semana</p>

                        <div className="mt-4 rounded-[1.75rem] border border-white/12 bg-black/10 p-5">
                            <p className="text-sm text-white/58">
                                Produto com maior interesse
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                                {analyticsStats.topProduct?.name ?? 'Nenhum contato ainda'}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/66">
                                {analyticsStats.topProduct
                                    ? `${formatMetric(analyticsStats.topProduct.clicks)} contatos acumulados no WhatsApp.`
                                    : 'Os primeiros contatos vao transformar este bloco em um termometro comercial.'}
                            </p>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                                <p className="admin-kicker admin-kicker-on-dark">Ritmo diario</p>
                                <p className="mt-2 text-2xl font-semibold text-white">
                                    {formatMetric(analyticsStats.clicksToday)}
                                </p>
                                <p className="mt-2 text-sm text-white/64">
                                    Contatos nas ultimas 24 horas.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                                <p className="admin-kicker admin-kicker-on-dark">Oferta visivel</p>
                                <p className="mt-2 text-2xl font-semibold text-white">
                                    {formatMetric(stats.totalProducts - stats.inactiveProducts)}
                                </p>
                                <p className="mt-2 text-sm text-white/64">
                                    Itens em exposicao com leitura comercial pronta.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/admin/produtos/novo"
                                className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--admin-obsidian)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[color:var(--admin-stone)]"
                            >
                                + Adicionar produto
                            </Link>
                            <Link
                                to="/admin/produtos"
                                className="admin-button-ghost flex-1"
                            >
                                Ver produtos
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex flex-col gap-2">
                    <p className="admin-kicker">Pulso do catalogo</p>
                    <h2 className="text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                        Estoque editorial do que o cliente enxerga.
                    </h2>
                    <p className="admin-subtle-text text-sm sm:text-base">
                        Cards com peso diferente para ativos, categorias e gargalos de publicacao.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4 xl:gap-5">
                    {inventoryCards.map((card) => (
                        <article key={card.label} className={`admin-stat-card ${card.variant}`}>
                            <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="admin-metric-label">{card.label}</p>
                                        <p className="admin-metric-value mt-4 break-words">
                                            {card.value}
                                        </p>
                                    </div>
                                    <span className={`admin-stat-icon ${card.iconVariant}`}>
                                        {card.icon}
                                    </span>
                                </div>
                                <p className="admin-metric-note max-w-[18rem]">
                                    {card.note}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex flex-col gap-2">
                    <p className="admin-kicker">Leitura comercial</p>
                    <h2 className="text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                        O que esta puxando conversa com o cliente.
                    </h2>
                    <p className="admin-subtle-text text-sm sm:text-base">
                        A secao prioriza interesse real, nao vaidade de acesso.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4 xl:gap-5">
                    {interestCards.map((card) => (
                        <article key={card.label} className={`admin-stat-card ${card.variant}`}>
                            <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="admin-metric-label">{card.label}</p>
                                        <p className="mt-4 break-words text-[1.85rem] font-semibold leading-tight text-[color:var(--admin-obsidian)] sm:text-[2.4rem]">
                                            {card.value}
                                        </p>
                                    </div>
                                    <span className={`admin-stat-icon ${card.iconVariant}`}>
                                        {card.icon}
                                    </span>
                                </div>
                                <p className="admin-metric-note max-w-[18rem]">
                                    {card.note}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                <section className="admin-panel p-6 sm:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="admin-kicker">Ranking de interesse</p>
                            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                                Top 5 produtos com mais conversa gerada.
                            </h2>
                        </div>
                        <p className="admin-subtle-text text-sm">
                            Volume total, tracao diaria e leitura semanal.
                        </p>
                    </div>

                    {analyticsStats.productClicks.length > 0 ? (
                        <>
                            <div className="mt-6 space-y-3 md:hidden">
                                {analyticsStats.productClicks.map((product, index) => (
                                    <article key={product.id} className="admin-list-card p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="admin-rank-badge">
                                                {index + 1}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-semibold text-[color:var(--admin-obsidian)] sm:text-base">
                                                        {product.name}
                                                    </h3>
                                                    <span className="admin-chip admin-chip--info">
                                                        {product.category}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                                    <div className="rounded-2xl bg-[color:var(--admin-success-soft)] px-3 py-3">
                                                        <p className="admin-kicker">Total</p>
                                                        <p className="mt-2 text-lg font-semibold text-[color:var(--admin-success)]">
                                                            {formatMetric(product.total_clicks)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl bg-[color:var(--admin-info-soft)] px-3 py-3">
                                                        <p className="admin-kicker">Hoje</p>
                                                        <p className="mt-2 text-lg font-semibold text-[color:var(--admin-info)]">
                                                            {formatMetric(product.clicks_today)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl bg-[color:var(--admin-violet-soft)] px-3 py-3">
                                                        <p className="admin-kicker">7 dias</p>
                                                        <p className="mt-2 text-lg font-semibold text-[color:var(--admin-violet)]">
                                                            {formatMetric(product.clicks_week)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-6 hidden overflow-x-auto md:block">
                                <table className="admin-table min-w-full">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Categoria</th>
                                            <th className="text-center">Total</th>
                                            <th className="text-center">Hoje</th>
                                            <th className="text-center">7 dias</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsStats.productClicks.map((product, index) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <div className="flex items-center gap-4">
                                                        <span className="admin-rank-badge">
                                                            {index + 1}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-[color:var(--admin-obsidian)]">
                                                                {product.name}
                                                            </p>
                                                            <p className="mt-1 text-sm admin-subtle-text">
                                                                Produto com maior procura consultiva.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="admin-chip admin-chip--info">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="text-center text-lg font-semibold text-[color:var(--admin-success)]">
                                                    {formatMetric(product.total_clicks)}
                                                </td>
                                                <td className="text-center text-sm font-semibold text-[color:var(--admin-info)]">
                                                    {formatMetric(product.clicks_today)}
                                                </td>
                                                <td className="text-center text-sm font-semibold text-[color:var(--admin-violet)]">
                                                    {formatMetric(product.clicks_week)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="mt-6 rounded-[1.75rem] border border-[color:var(--admin-line)] bg-white/70 px-6 py-8 text-center">
                            <p className="text-lg font-semibold text-[color:var(--admin-obsidian)]">
                                Ainda nao ha produtos com interesse registrado.
                            </p>
                            <p className="mt-2 text-sm admin-subtle-text">
                                Assim que o cliente clicar no WhatsApp, o ranking passa a destacar os itens que mais puxam conversa.
                            </p>
                        </div>
                    )}
                </section>

                <section className="admin-panel p-6 sm:p-8">
                    <div>
                        <p className="admin-kicker">Distribuicao do portfolio</p>
                        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                            Produtos por categoria.
                        </h2>
                        <p className="mt-2 text-sm admin-subtle-text">
                            Leitura rapida do peso de cada frente dentro do catalogo.
                        </p>
                    </div>

                    {categoryEntries.length > 0 ? (
                        <div className="mt-6 space-y-4">
                            {categoryEntries.map(([category, count]) => {
                                const percentage = stats.totalProducts > 0 ? Math.round((count / stats.totalProducts) * 100) : 0

                                return (
                                    <article key={category} className="admin-list-card p-4 sm:p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-[color:var(--admin-obsidian)] sm:text-base">
                                                    {category}
                                                </h3>
                                                <p className="mt-1 text-sm admin-subtle-text">
                                                    {count} {count === 1 ? 'produto' : 'produtos'} nesta frente.
                                                </p>
                                            </div>

                                            <span className="admin-chip admin-chip--neutral">
                                                {percentage}%
                                            </span>
                                        </div>

                                        <div className="mt-4 h-2.5 rounded-full bg-[rgba(24,20,16,0.08)]">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[color:var(--admin-obsidian)] to-[color:var(--admin-accent)]"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-[1.75rem] border border-[color:var(--admin-line)] bg-white/70 px-6 py-8 text-center">
                            <p className="text-lg font-semibold text-[color:var(--admin-obsidian)]">
                                Nenhuma categoria encontrada.
                            </p>
                            <p className="mt-2 text-sm admin-subtle-text">
                                Assim que os produtos forem classificados, esta secao passa a mostrar concentracao e equilibrio do portfolio.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <section className="admin-panel p-6 sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="admin-kicker">Acoes rapidas</p>
                        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                            Atalhos com cara de decisao, nao de menu solto.
                        </h2>
                    </div>
                    <p className="admin-subtle-text text-sm">
                        Fluxos mais usados no dia a dia comercial.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Link to="/admin/produtos/novo" className="admin-list-card group p-5 sm:p-6">
                        <p className="admin-kicker">Cadastro</p>
                        <h3 className="mt-3 text-xl font-semibold text-[color:var(--admin-obsidian)]">
                            Novo produto
                        </h3>
                        <p className="mt-2 text-sm leading-6 admin-subtle-text">
                            Abra um item novo com texto, imagem e CTA comercial prontos para o cliente.
                        </p>
                        <span className="admin-button-primary mt-6 w-full group-hover:shadow-xl">
                            Criar agora
                        </span>
                    </Link>

                    <Link to="/admin/produtos" className="admin-list-card group p-5 sm:p-6">
                        <p className="admin-kicker">Curadoria</p>
                        <h3 className="mt-3 text-xl font-semibold text-[color:var(--admin-obsidian)]">
                            Revisar portfolio
                        </h3>
                        <p className="mt-2 text-sm leading-6 admin-subtle-text">
                            Ajuste ativos, refine categorias e acompanhe o que precisa de aprovacao visual.
                        </p>
                        <span className="admin-button-secondary mt-6 w-full">
                            Ver produtos
                        </span>
                    </Link>

                    <Link to="/" className="admin-list-card group p-5 sm:p-6">
                        <p className="admin-kicker">Experiencia publica</p>
                        <h3 className="mt-3 text-xl font-semibold text-[color:var(--admin-obsidian)]">
                            Abrir catalogo
                        </h3>
                        <p className="mt-2 text-sm leading-6 admin-subtle-text">
                            Confira como as decisoes do backoffice aparecem na vitrine que o cliente final enxerga.
                        </p>
                        <span className="admin-button-secondary mt-6 w-full">
                            Visualizar agora
                        </span>
                    </Link>
                </div>
            </section>
        </div>
    )
}
