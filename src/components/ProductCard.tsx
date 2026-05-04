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
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Esgotado</span>
                    </div>
                )}
            </div>

            <div className="p-5 space-y-3">
                <h3 className="catalog-heading font-bold text-lg line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between">
                    <p className="catalog-price text-3xl font-extrabold">
                        {formatCurrency(product.price)}
                    </p>

                    {product.stock > 0 && (
                        <div className="catalog-stock flex items-center text-sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            {product.stock} em estoque
                        </div>
                    )}
                </div>

                <button className="catalog-primary-button w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform group-hover:shadow-lg">
                    Ver Detalhes
                </button>
            </div>
        </Link>
    )
}
