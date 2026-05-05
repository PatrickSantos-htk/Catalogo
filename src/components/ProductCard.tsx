import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const firstImage = product.images[0] || '/placeholder-product.png'

    return (
        <Link
            to={`/produto/${product.id}`}
            aria-label={`Ver detalhes do serviço ${product.name}`}
            className="group catalog-card rounded-[1.75rem] transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
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
                    <div className="absolute top-3 left-3 z-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-black blur-md opacity-30 rounded-lg"></div>
                            <span className="catalog-promo-badge relative inline-flex items-center px-3 py-1.5 text-xs font-extrabold rounded-lg shadow-xl">
                                🔥 PROMOÇÃO
                            </span>
                        </div>
                    </div>
                )}

                <div className="absolute top-3 right-3">
                    <span className="catalog-category-badge inline-block px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                        {product.category}
                    </span>
                </div>
            </div>

            <div className="p-5 space-y-3">
                <h3 className="catalog-heading font-bold text-lg line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                </h3>

                <p className="catalog-muted text-sm leading-relaxed min-h-[2.75rem]">
                    Atendimento consultivo e execução sob medida para o seu projeto.
                </p>

                <div className="flex items-center justify-between">
                    <p className="catalog-price text-3xl font-extrabold">
                        {formatCurrency(product.price)}
                    </p>
                </div>

                <span className="catalog-primary-button block w-full text-center font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform group-hover:shadow-lg">
                    Ver Detalhes e Orçamento
                </span>
            </div>
        </Link>
    )
}
