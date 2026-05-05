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
    const instagramProfileUrl = 'https://www.instagram.com/parceria_marmores.granito_?utm_source=qr&igsh=dDY3OXR4cGE5dGpio'
    const whatsappBudgetUrl = 'https://wa.me/5521973675618'
    const featuredVideos = [
        {
            title: 'Escada em mármore sob medida',
            label: 'Destaque principal',
            description: 'Evidencia presença visual, paginação e acabamento refinado em um projeto que valoriza a circulação e o impacto do ambiente.',
            gradient: 'from-[#0d0d0d] via-[#242424] to-[#5a5a5a]',
            videoSrc: '/videos/escada.mp4',
            videoPosition: 'center 32%',
            href: instagramProfileUrl,
        },
        {
            title: 'Acabamento em área gourmet',
            label: 'Área gourmet',
            description: 'Mostra a bancada aplicada no ambiente, destacando alinhamento das peças, polimento e leitura elegante da composição final.',
            gradient: 'from-[#1b1b1b] via-[#313131] to-[#737373]',
            videoSrc: '/videos/bancada.mp4',
            videoPosition: 'center 52%',
            href: instagramProfileUrl,
        },
        {
            title: 'Acabamento em banheiro',
            label: 'Ambiente interno',
            description: 'Apresenta um banheiro com acabamento limpo, proporção equilibrada e resultado final que reforça sofisticação e cuidado na execução.',
            gradient: 'from-[#111111] via-[#3a3a3a] to-[#7e7e7e]',
            videoSrc: '/videos/banheiro.mp4',
            videoPosition: 'center 38%',
            href: instagramProfileUrl,
        },
    ]

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
                                <a href={whatsappBudgetUrl} target="_blank" rel="noopener noreferrer" className="catalog-hero-link inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold transition-all hover:bg-white/10 sm:w-auto">
                                    Solicitar orçamento
                                </a>
                                <a
                                    href={instagramProfileUrl}
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

                        <section aria-labelledby="videos-heading" className="mb-16">
                            <div className="catalog-video-section overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="max-w-3xl">
                                        <div className="mb-4 flex flex-wrap items-center gap-3">
                                            <span className="catalog-pill inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                                                Portfólio em Vídeo
                                            </span>
                                            <span className="catalog-muted text-xs font-semibold uppercase tracking-[0.22em]">
                                                Obras reais em destaque
                                            </span>
                                        </div>
                                        <h2 id="videos-heading" className="catalog-heading text-2xl font-bold sm:text-3xl">
                                            Veja como os serviços ganham vida em obra
                                        </h2>
                                        <p className="catalog-muted mt-3 text-base leading-relaxed sm:text-lg">
                                            Uma seleção visual para transmitir acabamento, execução e presença real do serviço antes do cliente entrar em contato para orçamento.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <a
                                            href={instagramProfileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="catalog-primary-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold sm:text-base"
                                        >
                                            Ver mais vídeos
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
                                    <article className="catalog-video-card group rounded-[1.75rem] p-4 sm:p-5">
                                        {featuredVideos[0].videoSrc ? (
                                            <div className="catalog-video-frame">
                                                <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#0d0d0d] to-[#2d2d2d] px-4 py-3 text-white sm:px-5">
                                                    <span className="catalog-hero-pill inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                                                        {featuredVideos[0].label}
                                                    </span>
                                                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
                                                        Prévia contínua
                                                    </span>
                                                </div>

                                                <video
                                                    src={featuredVideos[0].videoSrc}
                                                    className="catalog-video-player"
                                                    style={{ objectPosition: featuredVideos[0].videoPosition }}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    preload="auto"
                                                    aria-label={`Prévia em vídeo: ${featuredVideos[0].title}`}
                                                >
                                                    Seu navegador não suporta reprodução de vídeo.
                                                </video>

                                                <div className="catalog-video-overlay">
                                                    <div className="catalog-video-overlay-copy">
                                                        <p className="catalog-video-overlay-kicker">Portfólio em obra</p>
                                                        <p className="catalog-video-overlay-title">Execução real com acabamento de alto padrão</p>
                                                    </div>
                                                    <span className="catalog-video-overlay-icon" aria-hidden="true">
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5.14v13.72a1 1 0 0 0 1.53.848l10.2-6.86a1 1 0 0 0 0-1.696l-10.2-6.86A1 1 0 0 0 8 5.14Z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <a
                                                href={featuredVideos[0].href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex min-h-[280px] flex-col justify-between rounded-[1.5rem] bg-gradient-to-br p-5 text-white transition-transform duration-300 hover:scale-[1.01] sm:min-h-[360px] sm:p-6 ${featuredVideos[0].gradient}`}
                                                aria-label={`Abrir vídeo ${featuredVideos[0].title}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <span className="catalog-hero-pill inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                                                        {featuredVideos[0].label}
                                                    </span>
                                                </div>

                                                <div className="flex items-end justify-between gap-4">
                                                    <div>
                                                        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-white/70">
                                                            Vídeo em destaque
                                                        </p>
                                                        <h3 className="max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
                                                            {featuredVideos[0].title}
                                                        </h3>
                                                    </div>

                                                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-lg">
                                                        <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M8 5.14v13.72a1 1 0 0 0 1.53.848l10.2-6.86a1 1 0 0 0 0-1.696l-10.2-6.86A1 1 0 0 0 8 5.14Z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </a>
                                        )}

                                        <div className="catalog-video-meta mt-4 rounded-[1.5rem] p-5 sm:p-6">
                                            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#404040]">
                                                Projeto em destaque
                                            </p>
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                                <div className="max-w-xl">
                                                    <p className="catalog-heading text-lg font-bold sm:text-xl">
                                                        {featuredVideos[0].title}
                                                    </p>
                                                    <p className="catalog-muted mt-2 text-sm leading-relaxed sm:text-base">
                                                        {featuredVideos[0].description}
                                                    </p>
                                                </div>
                                                <span className="catalog-pill inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                                                    Acabamento premium
                                                </span>
                                            </div>
                                        </div>
                                    </article>

                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                                        {featuredVideos.slice(1).map((video) => (
                                            <article key={video.title} className="catalog-video-card group rounded-[1.75rem] p-4 sm:p-5">
                                                {video.videoSrc ? (
                                                    <>
                                                        <div className="catalog-video-frame">
                                                            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#0d0d0d] to-[#2d2d2d] px-4 py-3 text-white sm:px-5">
                                                                <span className="catalog-hero-pill inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                                                                    {video.label}
                                                                </span>
                                                                <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
                                                                    Loop mudo
                                                                </span>
                                                            </div>

                                                            <video
                                                                src={video.videoSrc}
                                                                className="catalog-video-player"
                                                                style={{ objectPosition: video.videoPosition }}
                                                                autoPlay
                                                                loop
                                                                muted
                                                                playsInline
                                                                preload="auto"
                                                                aria-label={`Prévia em vídeo: ${video.title}`}
                                                            >
                                                                Seu navegador não suporta reprodução de vídeo.
                                                            </video>

                                                            <div className="catalog-video-overlay">
                                                                <div className="catalog-video-overlay-copy">
                                                                    <p className="catalog-video-overlay-kicker">Prévia contínua</p>
                                                                    <p className="catalog-video-overlay-title">Detalhes reais do acabamento</p>
                                                                </div>
                                                                <span className="catalog-video-overlay-icon" aria-hidden="true">
                                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M8 5.14v13.72a1 1 0 0 0 1.53.848l10.2-6.86a1 1 0 0 0 0-1.696l-10.2-6.86A1 1 0 0 0 8 5.14Z" />
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="px-1 pt-4">
                                                            <p className="catalog-heading text-lg font-bold">
                                                                {video.title}
                                                            </p>
                                                            <p className="catalog-muted mt-2 text-sm leading-relaxed">
                                                                {video.description}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <a
                                                            href={video.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex min-h-[220px] flex-col justify-between rounded-[1.5rem] bg-gradient-to-br p-5 text-white transition-transform duration-300 hover:scale-[1.01] sm:min-h-[240px] ${video.gradient}`}
                                                            aria-label={`Abrir vídeo ${video.title}`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <span className="catalog-hero-pill inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                                                                    {video.label}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-end justify-between gap-4">
                                                                <h3 className="max-w-[14rem] text-xl font-bold leading-tight">
                                                                    {video.title}
                                                                </h3>

                                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-lg">
                                                                    <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                        <path d="M8 5.14v13.72a1 1 0 0 0 1.53.848l10.2-6.86a1 1 0 0 0 0-1.696l-10.2-6.86A1 1 0 0 0 8 5.14Z" />
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>

                                                        <div className="px-2 pt-4">
                                                            <p className="catalog-muted text-sm leading-relaxed">
                                                                {video.description}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                </div>

                                <div className="catalog-video-footer mt-6 rounded-[1.5rem] p-5 sm:p-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="max-w-2xl">
                                            <p className="catalog-heading text-lg font-bold">
                                                Quer um resultado assim no seu projeto?
                                            </p>
                                            <p className="catalog-muted mt-2 text-sm leading-relaxed sm:text-base">
                                                Envie medidas, referências ou a ideia do ambiente e receba um atendimento consultivo para orçamento direto no WhatsApp.
                                            </p>
                                        </div>

                                        <a
                                            href={whatsappBudgetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="catalog-primary-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold sm:text-base"
                                        >
                                            Solicitar orçamento
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>
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
