import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import { AdminRoute } from './components/AdminRoute.tsx'
import { AdminPage } from './pages/AdminPage.tsx'
import { SignInPage } from './pages/SignInPage.tsx'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signin" element={<SignInPage />} />
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
