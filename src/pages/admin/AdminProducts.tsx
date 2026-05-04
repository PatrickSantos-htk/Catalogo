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

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

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
            const { error } = await supabase
                .from('products')
                .update({ active: !currentStatus })
                .eq('id', productId)

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
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Gerenciar Produtos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                    </p>
                </div>
                <Link to="/admin/produtos/novo" className="btn-primary">
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
                <div className="card overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Imagem
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Categoria
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Preço
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Estoque
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img
                                            src={product.images[0] || '/placeholder-product.png'}
                                            alt={product.name}
                                            className="h-16 w-16 object-cover rounded"
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {product.stock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleActive(product.id, product.active)}
                                            className={`px-3 py-1 text-xs font-medium rounded ${product.active
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                }`}
                                        >
                                            {product.active ? 'Ativo' : 'Inativo'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            to={`/admin/produtos/editar/${product.id}`}
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id, product.images)}
                                            className="text-red-600 dark:text-red-400 hover:underline"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
