export type PricingMode = 'quote' | 'starting_price'

export interface Product {
    id: string
    name: string
    description: string
    price: number
    pricing_mode: PricingMode
    category: string
    stock: number
    images: string[]
    specifications: Record<string, any>
    whatsapp_number: string
    whatsapp_message?: string
    active: boolean
    is_promotion: boolean
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    role?: 'admin' | 'user'
}

export interface AuthUser {
    user: User | null
    isAdmin: boolean
    isLoading: boolean
}
