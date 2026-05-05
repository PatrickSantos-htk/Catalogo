import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const firstImage = product.images[0] || '/placeholder-product.png'

    return (
        <Link
            to={`/produto/${product.id}`}
            aria-label={`Ver detalhes do serviço ${product.name}`}
            className="group catalog-card h-full overflow-hidden rounded-[1.4rem] transition-all duration-300 transform hover:-translate-y-1 sm:rounded-[1.75rem]"
        >
            <div className="catalog-card-image aspect-square overflow-hidden relative">
                <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />

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

            <div className="space-y-3 p-4 sm:p-5">
                <h3 className="catalog-heading min-h-[3rem] line-clamp-2 text-base font-bold sm:min-h-[3.5rem] sm:text-lg">
                    {product.name}
                </h3>

                <p className="catalog-muted min-h-[3rem] text-sm leading-relaxed sm:min-h-[3.25rem]">
                    Atendimento consultivo, definição de acabamento e execução sob medida para o seu projeto.
                    </p>

                <span className="catalog-primary-button block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300 transform group-hover:shadow-lg sm:text-base">
                    Ver Detalhes e Orçamento
                </span>
            </div>
        </Link>
    )
}
