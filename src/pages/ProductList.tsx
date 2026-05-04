import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
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

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category))
        return Array.from(cats).sort()
    }, [products])

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

            return matchesSearch && matchesCategory
        })
    }, [products, searchTerm, selectedCategory])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-white mb-4">
              Nossos Produtos
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Encontre produtos de qualidade com os melhores preços
            </p>
            <div className="mt-6">
              <a href="#sobre" className="text-white hover:text-blue-200 underline text-sm">
                Conheça nossa empresa
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters - Compacto */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="sm:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">📂 Todas</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Nenhum produto encontrado'
                  : 'Nenhum produto disponível no momento'}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Tente ajustar seus filtros de busca
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Sobre Nós Section */}
        <div id="sobre" className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Sobre Nós
            </h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
                Somos uma empresa comprometida em oferecer os melhores produtos com qualidade garantida e preços competitivos. 
                Nossa missão é proporcionar uma experiência de compra excepcional, conectando você aos produtos que fazem a diferença no seu dia a dia.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                Com anos de experiência no mercado, trabalhamos com fornecedores confiáveis e mantemos um rigoroso controle de qualidade. 
                Cada produto em nosso catálogo é cuidadosamente selecionado pensando em você.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Qualidade</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Produtos selecionados com rigor</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Melhor Preço</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Preços competitivos sempre</p>
                </div>
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Atendimento</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Suporte rápido via WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center pb-8">
          <p className="text-gray-600 dark:text-gray-400">
            © 2026 Catálogo de Produtos - Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>
  )
}
