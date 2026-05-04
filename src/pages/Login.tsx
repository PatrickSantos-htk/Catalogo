import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
    const navigate = useNavigate()
    const { user, isAdmin } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Redireciona se já estiver logado como admin
    if (user && isAdmin) {
        navigate('/admin')
        return null
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Verifica se é admin
            const isUserAdmin = data.user?.user_metadata?.role === 'admin'

            if (!isUserAdmin) {
                await supabase.auth.signOut()
                toast.error('Acesso negado. Apenas administradores podem fazer login.')
                return
            }

            toast.success('Login realizado com sucesso!')
            navigate('/admin')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao fazer login')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full">
                <div className="card">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Painel Admin
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Faça login para acessar o painel administrativo
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input"
                                placeholder="admin@exemplo.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Voltar para o catálogo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
