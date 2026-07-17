import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ShopActivityProvider } from './context/ShopActivityContext'
import LandingPage from './pages/LandingPage'
import BuyerLandingPage from './pages/BuyerLandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import AdminConsole from './pages/AdminConsole'
import NewsletterConfirmed from './pages/NewsletterConfirmed'
import CartPage from './pages/CartPage'
import HelpPage from './pages/HelpPage'

export default function App() {
  return (
    <AuthProvider>
      <ShopActivityProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<BuyerLandingPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/newsletter/confirmed" element={<NewsletterConfirmed />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
          </Routes>
        </BrowserRouter>
      </ShopActivityProvider>
    </AuthProvider>
  )
}
