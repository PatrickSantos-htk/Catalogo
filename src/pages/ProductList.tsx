import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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

    // Separate promotions from regular products
    const promotions = useMemo(() => {
        return filteredProducts.filter(p => p.is_promotion)
    }, [filteredProducts])

    const regularProducts = useMemo(() => {
        return filteredProducts.filter(p => !p.is_promotion)
    }, [filteredProducts])

    if (isLoading) {
        return (
            <div className="catalog-shell min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0d0d0d]"></div>
            </div>
        )
    }

    return (
        <div className="catalog-shell min-h-screen">
            {/* Header */}
            <header className="catalog-hero shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-5xl font-extrabold text-white mb-4">
                            Nossos Produtos
                        </h1>
                        <p className="text-xl text-[#d9d9d9] max-w-2xl mx-auto">
                            Encontre produtos de qualidade com os melhores preços
                        </p>
                        <div className="mt-6">
                            <a href="#sobre" className="text-[#d9d9d9] hover:text-white underline text-sm">
                                Conheça nossa empresa
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters - Compacto */}
                <div className="catalog-panel mb-8 rounded-[1.5rem] p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="🔍 Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="catalog-input w-full px-4 py-2.5 rounded-lg"
                            />
                        </div>

                        <div className="sm:w-56">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="catalog-input w-full px-4 py-2.5 rounded-lg"
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
                        <div className="catalog-panel inline-block p-6 rounded-2xl">
                            <svg className="w-20 h-20 mx-auto text-[#404040] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="catalog-muted text-lg font-medium">
                                {searchTerm || selectedCategory !== 'all'
                                    ? 'Nenhum produto encontrado'
                                    : 'Nenhum produto disponível no momento'}
                            </p>
                            <p className="catalog-muted text-sm mt-2 opacity-80">
                                Tente ajustar seus filtros de busca
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Promotions Section */}
                        {promotions.length > 0 && (
                            <div className="mb-12">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-[#404040]/20"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="catalog-promo-banner px-8 py-3 rounded-full shadow-xl">
                                            <span className="text-2xl font-extrabold text-white flex items-center">
                                                🔥 PROMOÇÕES EM DESTAQUE 🔥
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className="catalog-promo-section p-6 rounded-2xl">
                                    <p className="catalog-heading text-center font-bold text-lg mb-6">
                                        ⚡ {promotions.length} {promotions.length === 1 ? 'produto em promoção' : 'produtos em promoção'} ⚡
                                    </p>

                                    {promotions.length > 8 ? (
                                        <div className="carousel-container">
                                            <Swiper
                                                modules={[Navigation, Pagination, Autoplay]}
                                                spaceBetween={24}
                                                slidesPerView={1}
                                                navigation
                                                pagination={{ clickable: true }}
                                                autoplay={{
                                                    delay: 4000,
                                                    disableOnInteraction: false,
                                                }}
                                                breakpoints={{
                                                    640: { slidesPerView: 2, spaceBetween: 20 },
                                                    1024: { slidesPerView: 3, spaceBetween: 24 },
                                                    1280: { slidesPerView: 4, spaceBetween: 24 },
                                                }}
                                                className="products-swiper"
                                            >
                                                {promotions.map(product => (
                                                    <SwiperSlide key={product.id}>
                                                        <ProductCard product={product} />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {promotions.map(product => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Regular Products Section */}
                        {regularProducts.length > 0 && (
                            <>
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="catalog-heading text-2xl font-bold mb-2">
                                            {promotions.length > 0 ? 'Todos os Produtos' : 'Nossos Produtos'}
                                        </h2>
                                        <p className="catalog-muted font-medium">
                                            <span className="catalog-count font-bold text-lg">{regularProducts.length}</span> {regularProducts.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
                                        </p>
                                    </div>
                                    {regularProducts.length > 8 && (
                                        <span className="catalog-muted text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                            Use as setas para navegar
                                        </span>
                                    )}
                                </div>

                                {regularProducts.length > 8 ? (
                                    /* Carrossel para muitos produtos */
                                    <div className="mb-12 carousel-container">
                                        <Swiper
                                            modules={[Navigation, Pagination, Autoplay]}
                                            spaceBetween={24}
                                            slidesPerView={1}
                                            navigation
                                            pagination={{ clickable: true }}
                                            autoplay={{
                                                delay: 5000,
                                                disableOnInteraction: false,
                                            }}
                                            breakpoints={{
                                                640: {
                                                    slidesPerView: 2,
                                                    spaceBetween: 20,
                                                },
                                                1024: {
                                                    slidesPerView: 3,
                                                    spaceBetween: 24,
                                                },
                                                1280: {
                                                    slidesPerView: 4,
                                                    spaceBetween: 24,
                                                },
                                            }}
                                            className="products-swiper"
                                        >
                                            {regularProducts.map(product => (
                                                <SwiperSlide key={product.id}>
                                                    <ProductCard product={product} />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                ) : (
                                    /* Grid normal para poucos produtos */
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                        {regularProducts.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Sobre Nós Section */}
                <div id="sobre" className="catalog-panel mt-16 rounded-2xl p-8 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="catalog-heading text-3xl font-bold mb-6 text-center">
                            Sobre Nós
                        </h2>
                        <div className="mx-auto">
                            <p className="catalog-muted text-lg leading-relaxed mb-4">
                                Somos uma empresa comprometida em oferecer os melhores produtos com qualidade garantida e preços competitivos.
                                Nossa missão é proporcionar uma experiência de compra excepcional, conectando você aos produtos que fazem a diferença no seu dia a dia.
                            </p>
                            <p className="catalog-muted text-lg leading-relaxed mb-6">
                                Com anos de experiência no mercado, trabalhamos com fornecedores confiáveis e mantemos um rigoroso controle de qualidade.
                                Cada produto em nosso catálogo é cuidadosamente selecionado pensando em você.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 mt-8">
                                <div className="catalog-panel text-center p-6 rounded-xl">
                                    <div className="text-4xl mb-3">🎯</div>
                                    <h3 className="catalog-heading font-bold mb-2">Qualidade</h3>
                                    <p className="catalog-muted text-sm">Produtos selecionados com rigor</p>
                                </div>
                                <div className="catalog-panel text-center p-6 rounded-xl">
                                    <div className="text-4xl mb-3">💰</div>
                                    <h3 className="catalog-heading font-bold mb-2">Melhor Preço</h3>
                                    <p className="catalog-muted text-sm">Preços competitivos sempre</p>
                                </div>
                                <div className="catalog-panel text-center p-6 rounded-xl">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h3 className="catalog-heading font-bold mb-2">Atendimento</h3>
                                    <p className="catalog-muted text-sm">Suporte rápido via WhatsApp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-16 text-center pb-8">
                    <p className="catalog-muted">
                        © 2026 Catálogo de Produtos - Todos os direitos reservados
                    </p>
                </footer>
            </div>
        </div>
    )
}
