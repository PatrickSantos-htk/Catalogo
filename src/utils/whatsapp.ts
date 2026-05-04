/**
 * Gera um link do WhatsApp com mensagem pré-preenchida
 */
export function generateWhatsAppLink(
    phoneNumber: string,
    message?: string,
    productName?: string
): string {
    // Remove caracteres não numéricos
    const cleanNumber = phoneNumber.replace(/\D/g, '')

    // Define mensagem padrão se não fornecida
    const defaultMessage = productName
        ? `Olá! Tenho interesse no produto: ${productName}`
        : 'Olá! Tenho interesse em seus produtos.'

    const finalMessage = message || defaultMessage

    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(finalMessage)

    // Retorna o link do WhatsApp (formato internacional)
    return `https://wa.me/55${cleanNumber}?text=${encodedMessage}`
}

/**
 * Valida se um número de WhatsApp é válido (formato BR)
 */
export function isValidWhatsAppNumber(phoneNumber: string): boolean {
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    // Valida formato brasileiro: 11 dígitos (DDD + número com 9 dígitos)
    return /^[1-9]{2}9[0-9]{8}$/.test(cleanNumber)
}

/**
 * Formata número de telefone para exibição (55) 11 99999-9999
 */
export function formatPhoneNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '')

    if (cleanNumber.length === 11) {
        return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2, 7)}-${cleanNumber.slice(7)}`
    }

    return phoneNumber
}
