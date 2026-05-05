import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const firstImage = product.images[0] || '/placeholder-product.png'
    const showsStartingPrice = product.pricing_mode === 'starting_price' && product.price > 0

    return (
        <Link
            to={`/produto/${product.id}`}
            aria-label={`Ver detalhes do serviço ${product.name}`}
            className="group catalog-card flex h-full flex-col overflow-hidden rounded-[1.4rem] transition-all duration-300 transform hover:-translate-y-1 sm:rounded-[1.75rem]"
        >
            <div className="catalog-card-image aspect-square overflow-hidden relative">
                <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

                {/* Promotion Badge */}
                {product.is_promotion && (
                    <div className="absolute left-2.5 top-2.5 z-10 sm:left-3 sm:top-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-black blur-md opacity-30 rounded-lg"></div>
                            <span className="catalog-promo-badge relative inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-extrabold shadow-xl sm:px-3 sm:py-1.5 sm:text-xs">
                                🔥 PROMOÇÃO
                            </span>
                        </div>
                    </div>
                )}

                <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3">
                    <span className="catalog-category-badge inline-block rounded-full px-2.5 py-1 text-[11px] font-bold shadow-lg sm:px-3 sm:text-xs">
                        {product.category}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#404040]">
                        Projeto sob medida
                    </p>

                    <h3 className="catalog-heading min-h-[3rem] line-clamp-2 text-base font-bold sm:min-h-[3.5rem] sm:text-lg">
                        {product.name}
                    </h3>

                    <p className="catalog-muted min-h-[3rem] text-sm leading-relaxed sm:min-h-[3.25rem]">
                        Atendimento consultivo, definição de acabamento e execução sob medida para o seu projeto.
                    </p>
                </div>

                <div className="mt-auto space-y-3 pt-4">
                    {showsStartingPrice && (
                        <div className="rounded-[1rem] border border-[#0d0d0d]/8 bg-[#0d0d0d]/[0.03] px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#404040]">
                                Valor inicial
                            </p>
                            <p className="catalog-price mt-1 text-2xl font-extrabold leading-tight sm:text-[1.75rem]">
                                {formatCurrency(product.price)}
                            </p>
                        </div>
                    )}

                    <span className="catalog-primary-button block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300 transform group-hover:shadow-lg sm:text-base">
                    Ver Detalhes e Orçamento
                    </span>
                </div>
            </div>
        </Link>
    )
}
