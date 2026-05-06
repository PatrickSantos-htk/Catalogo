import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-toastify'
import type { Product } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
    const productsTable = supabase.from('products' as never) as unknown as {
        select: (query: string) => { order: (column: string, options: { ascending: boolean }) => Promise<{ data: Product[] | null; error: Error | null }> }
        update: (payload: unknown) => { eq: (column: string, value: string) => Promise<{ error: Error | null }> }
        delete: () => { eq: (column: string, value: string) => Promise<{ error: Error | null }> }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await productsTable.select('*').order('created_at', { ascending: false })

            if (error) throw error

            setProducts(data || [])
        } catch (error: any) {
            toast.error('Erro ao carregar produtos')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleActive = async (productId: string, currentStatus: boolean) => {
        try {
            const { error } = await productsTable.update({ active: !currentStatus }).eq('id', productId)

            if (error) throw error

            setProducts(products.map(p =>
                p.id === productId ? { ...p, active: !currentStatus } : p
            ))

            toast.success(`Produto ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
        } catch (error: any) {
            toast.error('Erro ao atualizar produto')
            console.error(error)
        }
    }

    const handleDelete = async (productId: string, images: string[]) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
            return
        }

        try {
            // Delete images from storage
            if (images.length > 0) {
                const imagePaths = images.map(url => {
                    const path = url.split('/product-images/')[1]
                    return path
                }).filter(Boolean)

                if (imagePaths.length > 0) {
                    await supabase.storage
                        .from('product-images')
                        .remove(imagePaths)
                }
            }

            // Delete product
            const { error } = await productsTable.delete().eq('id', productId)

            if (error) throw error

            setProducts(products.filter(p => p.id !== productId))
            toast.success('Produto excluído com sucesso')
        } catch (error: any) {
            toast.error('Erro ao excluir produto')
            console.error(error)
        }
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && product.active) ||
            (filterStatus === 'inactive' && !product.active)

        return matchesSearch && matchesStatus
    })

    const getPricingText = (product: Product) => {
        if (product.pricing_mode === 'starting_price' && product.price > 0) {
            return `A partir de ${formatCurrency(product.price)}`
        }

        return 'Sob orçamento'
    }

    const totalActive = products.filter((product) => product.active).length
    const totalInactive = products.length - totalActive
    const statusOptions: Array<{ value: 'all' | 'active' | 'inactive'; label: string; count: number }> = [
        { value: 'all', label: 'Todos', count: products.length },
        { value: 'active', label: 'Ativos', count: totalActive },
        { value: 'inactive', label: 'Inativos', count: totalInactive },
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
            <section className="admin-panel p-6 sm:p-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <p className="admin-kicker">Curadoria do portfólio</p>
                        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--admin-obsidian)] sm:text-4xl">
                            Produtos com leitura mais clara e comercial.
                        </h1>
                        <p className="mt-3 text-sm leading-7 admin-subtle-text sm:text-base">
                            Esta tela foi organizada para revisar status, encontrar itens rápido e manter a vitrine consistente com o atendimento consultivo.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[28rem]">
                        <div className="admin-panel-soft p-4">
                            <p className="admin-kicker">Visíveis</p>
                            <p className="mt-3 text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                                {totalActive}
                            </p>
                            <p className="mt-2 text-sm admin-subtle-text">
                                Itens ativos no catálogo.
                            </p>
                        </div>

                        <div className="admin-panel-soft p-4">
                            <p className="admin-kicker">Em pausa</p>
                            <p className="mt-3 text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                                {totalInactive}
                            </p>
                            <p className="mt-2 text-sm admin-subtle-text">
                                Produtos fora de exibição.
                            </p>
                        </div>

                        <div className="admin-panel-soft p-4">
                            <p className="admin-kicker">Filtrados</p>
                            <p className="mt-3 text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                                {filteredProducts.length}
                            </p>
                            <p className="mt-2 text-sm admin-subtle-text">
                                Resultado da busca atual.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="admin-section-divider mt-6" />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[color:var(--admin-obsidian)]">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                        </p>
                        <p className="mt-1 text-sm admin-subtle-text">
                            Cada item pode aparecer com valor inicial ou somente por orçamento.
                        </p>
                    </div>
                    <Link to="/admin/produtos/novo" className="admin-button-primary w-full sm:w-auto">
                        + Novo produto
                    </Link>
                </div>
            </section>

            <section className="admin-panel p-5 sm:p-6">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                            Buscar por nome
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: bancada sob medida"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium text-[color:var(--admin-bark)]">
                            Status da vitrine
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => {
                                const isActive = filterStatus === option.value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFilterStatus(option.value)}
                                        className={isActive ? 'admin-button-primary' : 'admin-button-secondary'}
                                    >
                                        {option.label}
                                        <span className={isActive ? 'text-white/72' : 'text-[color:var(--admin-bark)]/70'}>
                                            {option.count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {filteredProducts.length === 0 ? (
                <section className="admin-panel px-6 py-12 text-center sm:px-8">
                    <p className="text-xl font-semibold text-[color:var(--admin-obsidian)]">
                        Nenhum produto encontrado.
                    </p>
                    <p className="mt-2 text-sm admin-subtle-text">
                        Ajuste a busca ou o filtro para localizar itens da vitrine.
                    </p>
                </section>
            ) : (
                <section className="admin-panel p-5 sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="admin-kicker">Lista operacional</p>
                            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--admin-obsidian)]">
                                Produtos prontos para ação rápida.
                            </h2>
                        </div>
                        <p className="admin-subtle-text text-sm">
                            Edite, pause ou remova sem perder contexto comercial.
                        </p>
                    </div>

                    <div className="mt-6 space-y-3 md:hidden">
                        {filteredProducts.map((product) => (
                            <article key={product.id} className="admin-list-card p-4 sm:p-5">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={product.images[0] || '/placeholder-product.png'}
                                        alt={product.name}
                                        className="h-20 w-20 rounded-[1.1rem] object-cover shadow-sm"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h2 className="truncate text-base font-semibold text-[color:var(--admin-obsidian)]">
                                                    {product.name}
                                                </h2>
                                                <p className="mt-1 text-xs admin-subtle-text">
                                                    Criado em {formatDate(product.created_at)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleToggleActive(product.id, product.active)}
                                                className={`admin-chip ${product.active ? 'admin-chip--success' : 'admin-chip--danger'}`}
                                            >
                                                {product.active ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="admin-chip admin-chip--info">
                                                {product.category}
                                            </span>
                                            <span className={`admin-chip ${product.pricing_mode === 'starting_price' ? 'admin-chip--success' : 'admin-chip--warning'}`}>
                                                {getPricingText(product)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Link
                                        to={`/admin/produtos/editar/${product.id}`}
                                        className="admin-button-primary flex-1"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, product.images)}
                                        className="admin-button-danger flex-1"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 hidden overflow-x-auto md:block">
                        <table className="admin-table min-w-full">
                            <thead>
                                <tr>
                                    <th>Imagem</th>
                                    <th>Nome</th>
                                    <th>Categoria</th>
                                    <th>Comercial</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="whitespace-nowrap">
                                            <img
                                                src={product.images[0] || '/placeholder-product.png'}
                                                alt={product.name}
                                                className="h-16 w-16 rounded-[1rem] object-cover"
                                            />
                                        </td>
                                        <td>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[color:var(--admin-obsidian)]">
                                                    {product.name}
                                                </p>
                                                <p className="mt-1 text-sm admin-subtle-text">
                                                    Criado em {formatDate(product.created_at)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <span className="admin-chip admin-chip--info">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <span className={`admin-chip ${product.pricing_mode === 'starting_price' ? 'admin-chip--success' : 'admin-chip--warning'}`}>
                                                {getPricingText(product)}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleActive(product.id, product.active)}
                                                className={`admin-chip ${product.active ? 'admin-chip--success' : 'admin-chip--danger'}`}
                                            >
                                                {product.active ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    to={`/admin/produtos/editar/${product.id}`}
                                                    className="admin-button-secondary px-4 py-2 text-sm"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.images)}
                                                    className="admin-button-danger px-4 py-2 text-sm"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}
