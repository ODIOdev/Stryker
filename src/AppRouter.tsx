import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import { AdminRoute } from './components/AdminRoute.tsx'
import { DashboardRoute } from './components/DashboardRoute.tsx'
import { AdminPage } from './pages/AdminPage.tsx'
import { SignInPage } from './pages/SignInPage.tsx'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin" element={<Navigate to="/" replace />} />
        <Route
          path="/dashboard"
          element={
            <DashboardRoute>
              <App />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
