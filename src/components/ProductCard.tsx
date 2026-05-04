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
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
        <img
          src={firstImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-lg">
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
        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
            {formatCurrency(product.price)}
          </p>
          
          {product.stock > 0 && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {product.stock} em estoque
            </div>
          )}
        </div>
        
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform group-hover:shadow-lg">
          Ver Detalhes
        </button>
      </div>
    </Link>
  )
}
