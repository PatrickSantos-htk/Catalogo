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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        Gerenciar Produtos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                    </p>
                </div>
                <Link to="/admin/produtos/novo" className="btn-primary inline-flex w-full items-center justify-center sm:w-auto">
                    + Novo Produto
                </Link>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="input"
                        >
                            <option value="all">Todos os status</option>
                            <option value="active">Apenas ativos</option>
                            <option value="inactive">Apenas inativos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Nenhum produto encontrado
                    </p>
                </div>
            ) : (
                <div className="card space-y-4">
                    <div className="space-y-3 md:hidden">
                        {filteredProducts.map((product) => (
                            <article key={product.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={product.images[0] || '/placeholder-product.png'}
                                        alt={product.name}
                                        className="h-16 w-16 rounded-xl object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {product.name}
                                                </h2>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Criado em {formatDate(product.created_at)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleToggleActive(product.id, product.active)}
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${product.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}
                                            >
                                                {product.active ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {product.category}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(product.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Link
                                        to={`/admin/produtos/editar/${product.id}`}
                                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, product.images)}
                                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Imagem
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Categoria
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Preço
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <img
                                                src={product.images[0] || '/placeholder-product.png'}
                                                alt={product.name}
                                                className="h-16 w-16 rounded object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Criado em {formatDate(product.created_at)}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(product.id, product.active)}
                                                className={`rounded px-3 py-1 text-xs font-medium ${product.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}
                                            >
                                                {product.active ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium space-x-2">
                                            <Link
                                                to={`/admin/produtos/editar/${product.id}`}
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id, product.images)}
                                                className="text-red-600 hover:underline dark:text-red-400"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
