import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { supabase } from '../../lib/supabase'
import type { PricingMode, Product } from '../../types'
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

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('0')
    const [pricingMode, setPricingMode] = useState<PricingMode>('quote')
    const [category, setCategory] = useState('')
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [whatsappMessage, setWhatsappMessage] = useState('')
    const [active, setActive] = useState(true)
    const [isPromotion, setIsPromotion] = useState(false)

    const [existingImages, setExistingImages] = useState<string[]>([])
    const [newImageFiles, setNewImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const [specifications, setSpecifications] = useState<SpecificationField[]>([
        { key: '', value: '' },
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
            setPricingMode(data.pricing_mode || 'quote')
            setCategory(data.category)
            setWhatsappNumber(data.whatsapp_number)
            setWhatsappMessage(data.whatsapp_message || '')
            setActive(data.active)
            setIsPromotion(data.is_promotion || false)
            setExistingImages(data.images || [])

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

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        setNewImageFiles((previous) => [...previous, ...files])

        files.forEach((file) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreviews((previous) => [...previous, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeExistingImage = (index: number) => {
        setExistingImages((previous) => previous.filter((_, imageIndex) => imageIndex !== index))
    }

    const removeNewImage = (index: number) => {
        setNewImageFiles((previous) => previous.filter((_, imageIndex) => imageIndex !== index))
        setImagePreviews((previous) => previous.filter((_, imageIndex) => imageIndex !== index))
    }

    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }])
    }

    const removeSpecification = (index: number) => {
        if (specifications.length > 1) {
            setSpecifications(specifications.filter((_, specificationIndex) => specificationIndex !== index))
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

        if (!category.trim()) {
            toast.error('Categoria é obrigatória')
            return false
        }

        if (pricingMode === 'starting_price') {
            const priceNumber = parseFloat(price)

            if (isNaN(priceNumber) || priceNumber <= 0) {
                toast.error('Informe um valor inicial maior que zero')
                return false
            }
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
            const fileExtension = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExtension}`

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file)

            if (error) throw error

            const {
                data: { publicUrl },
            } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path)

            uploadedUrls.push(publicUrl)
        }

        return uploadedUrls
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        try {
            const newImageUrls = await uploadImages()
            const allImages = [...existingImages, ...newImageUrls]
            const productsTable = supabase.from('products' as never) as unknown as {
                update: (payload: unknown) => { eq: (column: string, value: string) => Promise<{ error: Error | null }> }
                insert: (payload: unknown) => Promise<{ error: Error | null }>
            }

            const specificationsObject: Record<string, any> = {}
            specifications.forEach((specification) => {
                if (specification.key.trim() && specification.value.trim()) {
                    specificationsObject[specification.key.trim()] = specification.value.trim()
                }
            })

            const productData = {
                name: name.trim(),
                description: description.trim(),
                price: pricingMode === 'starting_price' ? parseFloat(price || '0') || 0 : 0,
                pricing_mode: pricingMode,
                category: category.trim(),
                stock: 1,
                whatsapp_number: whatsappNumber.replace(/\D/g, ''),
                whatsapp_message: whatsappMessage.trim() || null,
                images: allImages,
                specifications: specificationsObject,
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
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 lg:space-y-8">
            <section className="admin-panel p-6 sm:p-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
                    <div>
                        <p className="admin-kicker">Cadastro comercial</p>
                        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--admin-obsidian)] sm:text-4xl">
                            {isEditing
                                ? 'Refine um produto com mais critério visual.'
                                : 'Monte um produto pronto para converter interesse em contato.'}
                        </h1>
                        <p className="mt-3 text-sm leading-7 admin-subtle-text sm:text-base">
                            Estruture conteúdo, escolha a estratégia comercial e deixe o item preparado para aparecer com mais clareza na vitrine pública.
                        </p>
                    </div>

                    <div className="admin-panel-soft p-5">
                        <p className="admin-kicker">Resumo da publicação</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`admin-chip ${pricingMode === 'starting_price' ? 'admin-chip--success' : 'admin-chip--warning'}`}>
                                {pricingMode === 'starting_price' ? 'Com valor inicial' : 'Sob orçamento'}
                            </span>
                            <span className={`admin-chip ${active ? 'admin-chip--success' : 'admin-chip--danger'}`}>
                                {active ? 'Ativo' : 'Em pausa'}
                            </span>
                            <span className={`admin-chip ${isPromotion ? 'admin-chip--warning' : 'admin-chip--neutral'}`}>
                                {isPromotion ? 'Em promoção' : 'Sem promoção'}
                            </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 admin-subtle-text">
                            Um bom cadastro aqui deixa a leitura do catálogo mais premium e facilita a abordagem do cliente no WhatsApp.
                        </p>
                    </div>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                <section className="admin-panel p-6 sm:p-8">
                    <h2 className="mb-6 text-xl font-semibold text-[color:var(--admin-obsidian)] sm:text-2xl">
                        Informações Básicas
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                                Nome do Produto *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="admin-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                                Descrição *
                            </label>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="admin-input min-h-[9rem] resize-y"
                                rows={5}
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                                Categoria *
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="admin-input"
                                required
                            />
                        </div>

                        <div className="admin-panel-soft space-y-4 p-4 sm:p-5">
                            <div>
                                <p className="text-sm font-semibold text-[color:var(--admin-obsidian)]">
                                    Forma de exibição comercial
                                </p>
                                <p className="mt-1 text-sm admin-subtle-text">
                                    Escolha se o item será exibido com valor inicial ou somente por orçamento.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setPricingMode('quote')}
                                    className={`admin-toggle-card text-left ${pricingMode === 'quote' ? 'admin-toggle-card--active' : ''}`}
                                >
                                    <p className="text-sm font-semibold text-[color:var(--admin-obsidian)]">Somente orçamento</p>
                                    <p className="mt-2 text-xs leading-5 admin-subtle-text">
                                        O card e o detalhe não exibem valor, só o CTA de orçamento.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPricingMode('starting_price')}
                                    className={`admin-toggle-card text-left ${pricingMode === 'starting_price' ? 'admin-toggle-card--active' : ''}`}
                                >
                                    <p className="text-sm font-semibold text-[color:var(--admin-obsidian)]">Exibir valor inicial</p>
                                    <p className="mt-2 text-xs leading-5 admin-subtle-text">
                                        O público vê a partir de com o valor informado no card e no detalhe.
                                    </p>
                                </button>
                            </div>

                            {pricingMode === 'starting_price' ? (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                                        Valor inicial (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={price}
                                        onChange={(event) => setPrice(event.target.value)}
                                        className="admin-input"
                                        placeholder="Ex: 350.00"
                                        required
                                    />
                                    <p className="mt-2 text-xs admin-subtle-text">
                                        Use o menor valor que faça sentido como ponto de partida comercial.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-[rgba(192,138,44,0.22)] bg-[color:var(--admin-warning-soft)] px-4 py-3 text-sm text-[color:var(--admin-bark)]">
                                    Este item ficará com foco em contato e orçamento, sem exibir valor público.
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="admin-checkbox-row flex items-center">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={active}
                                    onChange={(event) => setActive(event.target.checked)}
                                    className="h-4 w-4 rounded border-[color:var(--admin-line-strong)] text-[color:var(--admin-obsidian)] focus:ring-[color:var(--admin-accent)]"
                                />
                                <label htmlFor="active" className="ml-3 block text-sm text-[color:var(--admin-bark)]">
                                    Produto ativo (visível no catálogo público)
                                </label>
                            </div>

                            <div className="admin-checkbox-row flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_promotion"
                                    checked={isPromotion}
                                    onChange={(event) => setIsPromotion(event.target.checked)}
                                    className="h-4 w-4 rounded border-[color:var(--admin-line-strong)] text-[color:var(--admin-danger)] focus:ring-[color:var(--admin-danger)]"
                                />
                                <label htmlFor="is_promotion" className="ml-3 block text-sm text-[color:var(--admin-bark)]">
                                    Produto em promoção (destaque especial)
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="admin-panel p-6 sm:p-8">
                    <h2 className="mb-6 text-xl font-semibold text-[color:var(--admin-obsidian)] sm:text-2xl">
                        Imagens
                    </h2>

                    {existingImages.length > 0 && (
                        <div className="mb-5">
                            <p className="mb-3 text-sm admin-subtle-text">Imagens atuais:</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
                                {existingImages.map((url, index) => (
                                    <div key={index} className="admin-image-tile group">
                                        <img src={url} alt={`Imagem ${index + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute right-2 top-2 rounded-full bg-[rgba(24,20,16,0.86)] p-2 text-white opacity-100 transition-opacity hover:bg-[rgba(24,20,16,0.96)] sm:opacity-0 sm:group-hover:opacity-100"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {imagePreviews.length > 0 && (
                        <div className="mb-5">
                            <p className="mb-3 text-sm admin-subtle-text">Novas imagens:</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="admin-image-tile group">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute right-2 top-2 rounded-full bg-[rgba(24,20,16,0.86)] p-2 text-white opacity-100 transition-opacity hover:bg-[rgba(24,20,16,0.96)] sm:opacity-0 sm:group-hover:opacity-100"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                            Adicionar mais imagens
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="admin-input text-sm"
                        />
                        <p className="mt-2 text-sm admin-subtle-text">
                            PNG, JPG e WEBP até 5MB. Múltiplas imagens permitidas.
                        </p>
                    </div>
                </section>

                <section className="admin-panel p-6 sm:p-8">
                    <h2 className="mb-6 text-xl font-semibold text-[color:var(--admin-obsidian)] sm:text-2xl">
                        Contato via WhatsApp
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                                Número do WhatsApp * (formato: 11999999999)
                            </label>
                            <input
                                type="tel"
                                value={whatsappNumber}
                                onChange={(event) => setWhatsappNumber(event.target.value)}
                                className="admin-input"
                                placeholder="11999999999"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[color:var(--admin-bark)]">
                                Mensagem Personalizada (opcional)
                            </label>
                            <textarea
                                value={whatsappMessage}
                                onChange={(event) => setWhatsappMessage(event.target.value)}
                                className="admin-input min-h-[7rem] resize-y"
                                rows={3}
                                placeholder="Ex: Olá! Vi seu produto no catálogo e gostaria de mais informações."
                            />
                            <p className="mt-2 text-sm admin-subtle-text">
                                Se deixar vazio, uma mensagem padrão será usada.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="admin-panel p-6 sm:p-8">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold text-[color:var(--admin-obsidian)] sm:text-2xl">
                            Especificações Técnicas
                        </h2>
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="admin-button-secondary w-full sm:w-auto"
                        >
                            + Adicionar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {specifications.map((specification, index) => (
                            <div key={index} className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    type="text"
                                    value={specification.key}
                                    onChange={(event) => updateSpecification(index, 'key', event.target.value)}
                                    placeholder="Nome (ex: Peso)"
                                    className="admin-input w-full sm:flex-1"
                                />
                                <input
                                    type="text"
                                    value={specification.value}
                                    onChange={(event) => updateSpecification(index, 'value', event.target.value)}
                                    placeholder="Valor (ex: 2kg)"
                                    className="admin-input w-full sm:flex-1"
                                />
                                {specifications.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSpecification(index)}
                                        className="admin-button-danger w-full sm:w-auto"
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="submit" disabled={isLoading} className="admin-button-primary w-full sm:w-auto">
                        {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Criar Produto'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/produtos')}
                        className="admin-button-secondary w-full sm:w-auto"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}