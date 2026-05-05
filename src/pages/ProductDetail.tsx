import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'
import { generateWhatsAppLink, formatPhoneNumber } from '../utils/whatsapp'

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)

    useEffect(() => {
        if (id) {
            fetchProduct(id)
        }
    }, [id])

    const fetchProduct = async (productId: string) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .eq('active', true)
                .single()

            if (error) throw error

            setProduct(data)
            setIsLoading(false)
        } catch (error: any) {
            toast.error('Serviço não encontrado')
            setIsLoading(false)
        }
    }

    const trackWhatsAppClick = async () => {
        if (!product) return

        try {
            const analyticsTable = supabase.from('product_analytics' as never) as unknown as {
                insert: (payload: { product_id: string; event_type: string }) => Promise<unknown>
            }

            await analyticsTable.insert({
                product_id: product.id,
                event_type: 'whatsapp_click'
            })
        } catch (error) {
            // Silent fail - não queremos interromper a jornada do usuário
            console.error('Erro ao registrar clique:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="catalog-detail-shell min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0d0d0d]"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <main className="catalog-detail-shell min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="catalog-heading text-2xl font-bold mb-4">
                        Serviço não encontrado
                    </h2>
                    <Link to="/" className="btn-primary">
                        Voltar aos serviços
                    </Link>
                </div>
            </main>
        )
    }

    const whatsappLink = generateWhatsAppLink(
        product.whatsapp_number,
        product.whatsapp_message,
        product.name
    )

    return (
        <main className="catalog-detail-shell min-h-screen">
            {/* Breadcrumb */}
            <div className="catalog-detail-breadcrumb">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center text-sm space-x-2">
                        <Link to="/" className="catalog-detail-link hover:underline flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Início
                        </Link>
                        <span className="text-[#404040]/50">/</span>
                        <span className="catalog-muted font-medium">{product.name}</span>
                    </nav>
                </div>
            </div>

            <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Images */}
                    <section aria-labelledby="servico-descricao" className="space-y-4">
                        {/* Main Image */}
                        <div className="catalog-detail-panel aspect-square rounded-2xl overflow-hidden">
                            <img
                                src={product.images[selectedImage] || '/placeholder-product.png'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-4 transition-all ${selectedImage === index
                                            ? 'catalog-thumb-active scale-105'
                                            : 'border-transparent catalog-thumb-idle'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} - ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="catalog-detail-panel rounded-2xl p-5 sm:p-6 md:p-7">
                            <h2 id="servico-descricao" className="catalog-heading text-xl sm:text-2xl font-bold mb-4 flex items-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#404040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Descrição
                            </h2>
                            <p className="catalog-detail-description catalog-muted whitespace-pre-line text-base sm:text-[1.02rem]">
                                {product.description}
                            </p>
                        </div>
                    </section>

                    {/* Product Info */}
                    <section aria-labelledby="servico-titulo" className="space-y-6">
                        <div className="catalog-detail-hero-panel rounded-[1.75rem] p-5 sm:p-6 md:p-8">
                            <span className="catalog-pill inline-block px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-bold rounded-full uppercase tracking-wide">
                                {product.category}
                            </span>

                            <h1 id="servico-titulo" className="catalog-heading text-3xl sm:text-4xl md:text-5xl font-extrabold mt-4 sm:mt-5 leading-tight">
                                {product.name}
                            </h1>

                            <p className="catalog-muted text-[0.98rem] sm:text-base md:text-lg leading-relaxed mt-4 max-w-2xl">
                                Solução ideal para projetos que exigem acabamento refinado, execução sob medida e atendimento consultivo do primeiro contato até a instalação.
                            </p>

                            <div className="catalog-detail-price-row mt-6 sm:mt-8 py-5 sm:py-6 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-[#404040] mb-2">
                                        Valor de Referência
                                    </p>
                                    <p className="catalog-price text-4xl sm:text-5xl font-extrabold leading-none sm:leading-tight">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                                <div className="catalog-pill inline-flex items-center self-start px-3 py-2 sm:px-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.2em] rounded-full sm:self-auto">
                                    Solicite Seu Orçamento
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <div className="catalog-detail-panel rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-[#404040] mb-2">Atendimento</p>
                                    <p className="catalog-heading font-semibold">Resposta Rápida no WhatsApp</p>
                                    <p className="catalog-muted text-sm mt-2">Retorno ágil para tirar dúvidas, alinhar medidas e avançar com o orçamento.</p>
                                </div>
                                <div className="catalog-detail-panel rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-[#404040] mb-2">Ideal Para</p>
                                    <p className="catalog-heading font-semibold">Projetos que exigem personalização e acabamento profissional</p>
                                    <p className="catalog-muted text-sm mt-2">Perfeito para ambientes residenciais, comerciais e execuções sob medida.</p>
                                </div>
                            </div>

                            <div className="catalog-detail-inline-cta mt-6 rounded-2xl p-4 sm:p-5 md:p-6">
                                <h3 className="catalog-heading text-lg sm:text-xl font-bold mb-2 flex items-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Interessado neste serviço?
                                </h3>
                                <p className="catalog-muted mb-4 text-base sm:text-[1.02rem]">
                                    Entre em contato via WhatsApp: <span className="font-bold">{formatPhoneNumber(product.whatsapp_number)}</span>
                                </p>
                                <div className="catalog-detail-cta-note rounded-2xl p-4 mb-4 sm:mb-5">
                                    <p className="catalog-heading font-semibold mb-1">Atendimento para Orçamento</p>
                                    <p className="catalog-muted text-sm">
                                        Envie sua ideia, medidas ou referência e receba um atendimento rápido para montar sua proposta.
                                    </p>
                                    <ul className="catalog-muted text-sm mt-3 space-y-2">
                                        <li>• Compartilhe fotos, medidas ou inspirações do ambiente</li>
                                        <li>• Receba orientação sobre acabamento e melhor solução</li>
                                        <li>• Avance com um orçamento alinhado ao seu projeto</li>
                                    </ul>
                                </div>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Falar no WhatsApp sobre ${product.name}`}
                                    onClick={trackWhatsAppClick}
                                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] sm:hover:scale-105"
                                >
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Falar no WhatsApp
                                </a>
                            </div>
                        </div>

                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="catalog-detail-panel rounded-2xl p-5 sm:p-6 md:p-7">
                                <h2 className="catalog-heading text-xl sm:text-2xl font-bold mb-4 flex items-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#404040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Especificações
                                </h2>
                                <dl className="space-y-3">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="catalog-spec-row flex flex-col gap-1 py-3 border-b last:border-0 sm:flex-row sm:items-center sm:justify-between">
                                            <dt className="catalog-heading font-semibold">{key}</dt>
                                            <dd className="catalog-muted font-medium">{String(value)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                    </section>
                </div>
            </article>
        </main>
    )
}
