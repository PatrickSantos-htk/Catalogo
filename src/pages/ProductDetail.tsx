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
            toast.error('Produto não encontrado')
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Produto não encontrado
                    </h2>
                    <Link to="/" className="btn-primary">
                        Voltar ao catálogo
                    </Link>
                </div>
            </div>
        )
    }

    const whatsappLink = generateWhatsAppLink(
        product.whatsapp_number,
        product.whatsapp_message,
        product.name
    )

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="text-sm">
                        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Catálogo
                        </Link>
                        <span className="mx-2 text-gray-500">/</span>
                        <span className="text-gray-600 dark:text-gray-400">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Images */}
                    <div>
                        {/* Main Image */}
                        <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                            <img
                                src={product.images[selectedImage] || '/placeholder-product.png'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${selectedImage === index
                                                ? 'border-blue-600'
                                                : 'border-transparent hover:border-gray-300'
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
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full uppercase">
                                {product.category}
                            </span>

                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
                                {product.name}
                            </h1>

                            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-4">
                                {formatCurrency(product.price)}
                            </p>

                            <div className="mt-4">
                                {product.stock > 0 ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        ✓ {product.stock} unidades em estoque
                                    </span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                        ✗ Produto esgotado
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Descrição
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    Especificações
                                </h2>
                                <dl className="space-y-2">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                                            <dt className="font-medium text-gray-700 dark:text-gray-300">{key}:</dt>
                                            <dd className="text-gray-600 dark:text-gray-400">{String(value)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {/* WhatsApp Button */}
                        <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Interessado neste produto?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Entre em contato via WhatsApp: {formatPhoneNumber(product.whatsapp_number)}
                            </p>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                Falar no WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
