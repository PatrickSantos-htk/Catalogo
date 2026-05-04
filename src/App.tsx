import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// Pages - Public
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'

// Pages - Auth
import Login from './pages/Login'

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'

// Components
import PrivateRoute from './components/PrivateRoute'
import AdminLayout from './components/AdminLayout'

function App() {
    return (
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ProductList />} />
                <Route path="/produto/:id" element={<ProductDetail />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />

                {/* Admin Routes - Protected */}
                <Route element={<PrivateRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/produtos" element={<AdminProducts />} />
                        <Route path="/admin/produtos/novo" element={<ProductForm />} />
                        <Route path="/admin/produtos/editar/:id" element={<ProductForm />} />
                    </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
