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

    useEffect(() => {
        fetchProducts()

        const channel = supabase
            .channel('public-products-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    fetchProducts()
                }
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [])

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
                <div className="catalog-hero-brand">
                    <div className="catalog-brand-logo rounded-2xl">
                        <img
                            src="/banner%20leo.jpeg"
                            alt="Logo da marca"
                            className="catalog-brand-logo-image"
                        />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-14">
                    <div className="catalog-hero-grid">
                        <div className="catalog-brand-card overflow-hidden rounded-[1.75rem] p-5 text-white sm:rounded-[2rem] sm:p-8 lg:p-10">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="catalog-hero-pill inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] sm:px-4 sm:text-xs sm:tracking-[0.24em]">
                                    Orçamento Consultivo
                                </span>
                                <span className="catalog-hero-pill inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] sm:px-4 sm:text-xs sm:tracking-[0.24em]">
                                    Execução Sob Medida
                                </span>
                            </div>

                            <div>
                                <p className="text-sm uppercase tracking-[0.32em] text-[#d9d9d9] mb-2">
                                    Serviços em Mármore e Granito
                                </p>
                                <h1 className="text-3xl font-extrabold leading-[1.02] mb-4 sm:text-5xl sm:leading-[0.98] lg:text-6xl">
                                    Seu projeto em mármore e granito com acabamento de alto padrão, do orçamento à instalação.
                                </h1>
                                <p className="text-base sm:text-lg text-[#d9d9d9] max-w-2xl leading-relaxed">
                                    Atendemos projetos residenciais, comerciais e corporativos com orientação técnica, corte sob medida, instalação especializada e um atendimento rápido para transformar sua ideia em execução.
                                </p>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <a href="#produtos" className="catalog-primary-button inline-flex w-full items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all sm:w-auto">
                                    Ver Serviços
                                </a>
                                <a href="https://wa.me/5521973675618" target="_blank" rel="noopener noreferrer" className="catalog-hero-link inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold transition-all hover:bg-white/10 sm:w-auto">
                                    Solicitar orçamento
                                </a>
                                <a
                                    href="https://www.instagram.com/parceria_marmores.granito_?utm_source=qr&igsh=dDY3OXR4cGE5dGpio"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="catalog-hero-link inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold transition-all hover:bg-white/10 sm:w-auto"
                                    aria-label="Abrir Instagram da empresa"
                                >
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.88 1.75a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.5A4 4 0 1 0 16 12a4 4 0 0 0-4-4Z" />
                                    </svg>
                                    Instagram
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-3 self-stretch sm:gap-4">
                            <div className="catalog-hero-stat rounded-[1.75rem] p-6 text-white">
                                <p className="text-xs uppercase tracking-[0.28em] text-[#d9d9d9] mb-3">Atendimento Especializado</p>
                                <h2 className="text-xl font-bold mb-2 sm:text-2xl">Precisão técnica em cada etapa do serviço</h2>
                                <p className="text-sm leading-relaxed text-[#d9d9d9]">
                                    Equipe experiente em medição, corte, acabamento e instalação para entregar segurança, durabilidade e resultado final à altura do seu projeto.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                <div className="catalog-hero-stat rounded-[1.5rem] p-5 text-white">
                                    <p className="text-2xl font-extrabold sm:text-3xl">Agilidade</p>
                                    <p className="mt-2 text-sm text-[#d9d9d9]">Orçamento e retorno direto para acelerar sua decisão</p>
                                </div>
                                <div className="catalog-hero-stat rounded-[1.5rem] p-5 text-white">
                                    <p className="text-2xl font-extrabold sm:text-3xl">Execução</p>
                                    <p className="mt-2 text-sm text-[#d9d9d9]">Acabamento profissional do planejamento à instalação</p>
                                </div>
                            </div>

                            <div className="catalog-hero-stat rounded-[1.75rem] p-6 text-white">
                                <p className="text-xs uppercase tracking-[0.28em] text-[#d9d9d9] mb-3">Como Trabalhamos</p>
                                <ul className="space-y-3 text-sm text-[#d9d9d9]">
                                    <li>Análise do projeto para indicar a melhor solução</li>
                                    <li>Corte sob medida com acabamento alinhado ao ambiente</li>
                                    <li>Instalação profissional para residências, empresas e obras</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Filters - Compacto */}
                <section aria-label="Filtros de busca" className="catalog-panel mb-8 rounded-[1.5rem] p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="🔍 Buscar serviços e soluções..."
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
                </section>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="catalog-panel inline-block rounded-2xl p-5 sm:p-6">
                            <svg className="w-20 h-20 mx-auto text-[#404040] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="catalog-muted text-lg font-medium">
                                {searchTerm || selectedCategory !== 'all'
                                    ? 'Nenhum serviço encontrado'
                                    : 'Nenhum serviço disponível no momento'}
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
                            <section aria-labelledby="promocoes-heading" className="mb-12">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-[#404040]/20"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <div className="catalog-promo-banner rounded-full px-4 py-2.5 shadow-xl sm:px-8 sm:py-3">
                                            <h2 id="promocoes-heading" className="flex items-center text-center text-base font-extrabold text-white sm:text-2xl">
                                                🔥 PROMOÇÕES EM DESTAQUE 🔥
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="catalog-promo-section rounded-2xl p-4 sm:p-6">
                                    <p className="catalog-heading mb-6 text-center text-base font-bold sm:text-lg">
                                        ⚡ {promotions.length} {promotions.length === 1 ? 'serviço em destaque' : 'serviços em destaque'} ⚡
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
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                                            {promotions.map(product => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Regular Products Section */}
                        {regularProducts.length > 0 && (
                            <section aria-labelledby="servicos-heading">
                                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 id="servicos-heading" className="catalog-heading mb-2 text-xl font-bold sm:text-2xl">
                                            {promotions.length > 0 ? 'Todos os Serviços' : 'Nossos Serviços'}
                                        </h2>
                                        <p className="catalog-muted font-medium">
                                            <span className="catalog-count font-bold text-lg">{regularProducts.length}</span> {regularProducts.length === 1 ? 'serviço disponível' : 'serviços disponíveis'}
                                        </p>
                                    </div>
                                    {regularProducts.length > 8 && (
                                        <span className="catalog-muted hidden text-sm sm:flex items-center">
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
                                    <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                                        {regularProducts.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}

                {/* Sobre Nós Section */}
                <section id="sobre" aria-labelledby="sobre-heading" className="catalog-panel mt-16 rounded-2xl p-6 sm:p-8 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <h2 id="sobre-heading" className="catalog-heading mb-6 text-center text-2xl font-bold sm:text-3xl">
                            Por Que Escolher Nosso Atendimento
                        </h2>

                        <div className="mx-auto text-center">
                            <p className="catalog-muted mb-4 text-base leading-relaxed sm:text-lg">
                                Mais do que apresentar materiais, entregamos soluções completas em mármore, granito e lâminas para projetos residenciais, comerciais e corporativos que exigem acabamento de alto padrão.
                            </p>

                            <p className="catalog-muted mb-6 text-base leading-relaxed sm:text-lg">
                                Cada atendimento começa no entendimento do seu projeto, passa pela orientação técnica e chega a uma execução precisa, com corte, acabamento e instalação pensados para valorizar o seu ambiente.
                            </p>

                            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                                <div className="catalog-panel text-center p-6 rounded-xl">
                                    <div className="text-4xl mb-3">🪨</div>
                                    <h3 className="catalog-heading font-bold mb-2">Solução de Alto Padrão</h3>
                                    <p className="catalog-muted text-sm">Acabamento sofisticado para cozinhas, banheiros, áreas gourmet e ambientes comerciais.</p>
                                </div>

                                <div className="catalog-panel text-center p-6 rounded-xl">
                                    <div className="text-4xl mb-3">📐</div>
                                    <h3 className="catalog-heading font-bold mb-2">Orçamento Consultivo</h3>
                                    <p className="catalog-muted text-sm">Analisamos medidas, acabamento e necessidade da obra para indicar a melhor solução.</p>
                                </div>

                                <div className="catalog-panel text-center p-6 rounded-xl">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h3 className="catalog-heading font-bold mb-2">Execução Completa</h3>
                                    <p className="catalog-muted text-sm">Você fala com uma equipe que acompanha do primeiro contato até a entrega final.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="mt-16 text-center pb-8">
                    <p className="catalog-muted text-sm sm:text-base">
                        © 2026 - Mármore e Granito | Todos os direitos reservados
                    </p>
                </footer>
            </main>
        </div>
    )
}
