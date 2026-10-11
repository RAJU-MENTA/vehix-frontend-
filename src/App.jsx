import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { api } from './services/api.js'
import { AppLayout } from './components/AppLayout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { VehiclesPage } from './pages/VehiclesPage.jsx'
import { VehicleDetailsPage } from './pages/VehicleDetailsPage.jsx'
import { BookingPage } from './pages/BookingPage.jsx'
import { MyBookingsPage } from './pages/MyBookingsPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { SellerDashboardPage } from './pages/SellerDashboardPage.jsx'
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { SupportPage } from './pages/SupportPage.jsx'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('vehixToken') || '')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vehixUser')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [alert, setAlert] = useState('')

  useEffect(() => {
    if (!alert) return undefined
    const timeoutId = window.setTimeout(() => setAlert(''), 5000)
    return () => window.clearTimeout(timeoutId)
  }, [alert])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('vehixUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('vehixUser')
    }
  }, [user])

  const login = (authUser, authToken) => {
    setUser(authUser)
    setToken(authToken)
    localStorage.setItem('vehixToken', authToken)
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('vehixToken')
    localStorage.removeItem('vehixUser')
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        {alert && <div className="top-alert" role="status">{alert}</div>}
        <AppLayout user={user} onLogout={logout}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:vehicleId" element={<VehicleDetailsPage />} />
            <Route path="/login" element={<LoginPage onLogin={login} setAlert={setAlert} />} />
            <Route path="/register" element={<RegisterPage onLogin={login} setAlert={setAlert} />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/booking/:vehicleId" element={<ProtectedRoute user={user}><BookingPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute user={user}><ProfilePage user={user} /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute user={user}><MyBookingsPage user={user} /></ProtectedRoute>} />
            <Route path="/seller-dashboard" element={<ProtectedRoute user={user} allowedRoles={['SELLER', 'ADMIN']}><SellerDashboardPage user={user} /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute user={user} allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </div>
    </BrowserRouter>
  )
}

export default App
