import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-toastify'
import type { Product } from '../../types'
import { isValidWhatsAppNumber } from '../../utils/whatsapp'

interface SpecificationField {
    key: string
    value: string
}

export default function ProductForm() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const isEditing = Boolean(id)

    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingProduct, setIsFetchingProduct] = useState(isEditing)

    // Form fields
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('')
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [whatsappMessage, setWhatsappMessage] = useState('')
    const [active, setActive] = useState(true)
    const [isPromotion, setIsPromotion] = useState(false)

    // Images
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [newImageFiles, setNewImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    // Specifications
    const [specifications, setSpecifications] = useState<SpecificationField[]>([
        { key: '', value: '' }
    ])

    useEffect(() => {
        if (isEditing && id) {
            fetchProduct(id)
        }
    }, [id, isEditing])

    const fetchProduct = async (productId: string) => {
        try {
            const { data, error } = await (
                supabase
                    .from('products' as never)
                    .select('*')
                    .eq('id', productId)
                    .single() as unknown as Promise<{ data: Product | null; error: Error | null }>
            )

            if (error) throw error
            if (!data) throw new Error('Produto não encontrado')

            setName(data.name)
            setDescription(data.description)
            setPrice(data.price.toString())
            setCategory(data.category)
            setWhatsappNumber(data.whatsapp_number)
            setWhatsappMessage(data.whatsapp_message || '')
            setActive(data.active)
            setIsPromotion(data.is_promotion || false)
            setExistingImages(data.images || [])

            // Convert specifications object to array
            if (data.specifications && typeof data.specifications === 'object') {
                const specsArray = Object.entries(data.specifications).map(([key, value]) => ({
                    key,
                    value: String(value),
                }))
                setSpecifications(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }])
            }
        } catch (error: any) {
            toast.error('Erro ao carregar produto')
            navigate('/admin/produtos')
        } finally {
            setIsFetchingProduct(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setNewImageFiles(prev => [...prev, ...files])

        // Create previews
        files.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const removeNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }])
    }

    const removeSpecification = (index: number) => {
        if (specifications.length > 1) {
            setSpecifications(specifications.filter((_, i) => i !== index))
        }
    }

    const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
        const updated = [...specifications]
        updated[index][field] = value
        setSpecifications(updated)
    }

    const validateForm = (): boolean => {
        if (!name.trim()) {
            toast.error('Nome do produto é obrigatório')
            return false
        }

        if (!description.trim()) {
            toast.error('Descrição é obrigatória')
            return false
        }

        const priceNum = parseFloat(price)
        if (isNaN(priceNum) || priceNum <= 0) {
            toast.error('Preço deve ser maior que zero')
            return false
        }

        if (!category.trim()) {
            toast.error('Categoria é obrigatória')
            return false
        }

        if (!whatsappNumber.trim()) {
            toast.error('Número do WhatsApp é obrigatório')
            return false
        }

        if (!isValidWhatsAppNumber(whatsappNumber)) {
            toast.error('Número do WhatsApp inválido. Use o formato: (XX) 9XXXX-XXXX')
            return false
        }

        if (existingImages.length === 0 && newImageFiles.length === 0) {
            toast.error('Adicione pelo menos uma imagem ao produto')
            return false
        }

        return true
    }

    const uploadImages = async (): Promise<string[]> => {
        const uploadedUrls: string[] = []

        for (const file of newImageFiles) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file)

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path)

            uploadedUrls.push(publicUrl)
        }

        return uploadedUrls
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        try {
            // Upload new images
            const newImageUrls = await uploadImages()
            const allImages = [...existingImages, ...newImageUrls]
            const productsTable = supabase.from('products' as never) as unknown as {
                update: (payload: unknown) => { eq: (column: string, value: string) => Promise<{ error: Error | null }> }
                insert: (payload: unknown) => Promise<{ error: Error | null }>
            }

            // Convert specifications array to object
            const specsObject: Record<string, any> = {}
            specifications.forEach(spec => {
                if (spec.key.trim() && spec.value.trim()) {
                    specsObject[spec.key.trim()] = spec.value.trim()
                }
            })

            const productData = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                category: category.trim(),
                stock: 1,
                whatsapp_number: whatsappNumber.replace(/\D/g, ''),
                whatsapp_message: whatsappMessage.trim() || null,
                images: allImages,
                specifications: specsObject,
                active,
                is_promotion: isPromotion,
            }

            if (isEditing && id) {
                const { error } = await productsTable.update(productData).eq('id', id)

                if (error) throw error
                toast.success('Produto atualizado com sucesso!')
            } else {
                const { error } = await productsTable.insert([productData])

                if (error) throw error
                toast.success('Produto criado com sucesso!')
            }

            navigate('/admin/produtos')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar produto')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetchingProduct) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    {isEditing ? 'Editar Produto' : 'Novo Produto'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Informações Básicas
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome do Produto *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descrição *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input"
                                rows={5}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Preço (R$) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categoria *
                                </label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="active"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Produto ativo (visível no catálogo público)
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_promotion"
                                checked={isPromotion}
                                onChange={(e) => setIsPromotion(e.target.checked)}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_promotion" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                🔥 Produto em promoção (destaque especial)
                            </label>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Imagens
                    </h2>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Imagens atuais:
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
                                {existingImages.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-2 right-2 rounded bg-red-600 p-1 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Novas imagens:
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-2 right-2 rounded bg-red-600 p-1 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Adicionar mais imagens
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            PNG, JPG, WEBP até 5MB. Múltiplas imagens permitidas.
                        </p>
                    </div>
                </div>

                {/* WhatsApp */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Contato via WhatsApp
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Número do WhatsApp * (formato: 11999999999)
                            </label>
                            <input
                                type="tel"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="input"
                                placeholder="11999999999"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mensagem Personalizada (opcional)
                            </label>
                            <textarea
                                value={whatsappMessage}
                                onChange={(e) => setWhatsappMessage(e.target.value)}
                                className="input"
                                rows={3}
                                placeholder="Ex: Olá! Vi seu produto no catálogo e gostaria de mais informações."
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Se deixar vazio, uma mensagem padrão será usada.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                <div className="card">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Especificações Técnicas
                        </h2>
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="btn-secondary w-full text-sm sm:w-auto"
                        >
                            + Adicionar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {specifications.map((spec, index) => (
                            <div key={index} className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    type="text"
                                    value={spec.key}
                                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                                    placeholder="Nome (ex: Peso)"
                                    className="input w-full sm:flex-1"
                                />
                                <input
                                    type="text"
                                    value={spec.value}
                                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                    placeholder="Valor (ex: 2kg)"
                                    className="input w-full sm:flex-1"
                                />
                                {specifications.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSpecification(index)}
                                        className="btn-danger w-full sm:w-auto"
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Criar Produto'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/produtos')}
                        className="btn-secondary w-full sm:w-auto"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}