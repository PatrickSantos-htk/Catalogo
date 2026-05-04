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
            className="card hover:shadow-xl transition-shadow duration-300 group"
        >
            <div className="aspect-square overflow-hidden rounded-md mb-4 bg-gray-200 dark:bg-gray-700">
                <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </div>

            <div className="space-y-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
                    {product.category}
                </span>

                <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(product.price)}
                </p>

                {product.stock > 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estoque: {product.stock} unidades
                    </p>
                ) : (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Esgotado
                    </p>
                )}
            </div>
        </Link>
    )
}
