import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"

import LoginPage from "./pages/Login"
import RegisterPage from "./pages/Register"
import ForgotPasswordPage from "./pages/ForgotPassword"
import ResetPasswordPage from "./pages/ResetPassword"
import DashboardPage from "./pages/Dashboard"
import WishlistDetailPage from "./pages/WishlistDetail"
import ProfilePage from "./pages/Profile"
import DiscoverPage from "./pages/Discover"
import FollowingPage from "./pages/Following"
import PublicProfilePage from "./pages/PublicProfile"

import { Toaster } from "react-hot-toast"

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="wishlists/:id" element={<WishlistDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="following" element={<FollowingPage />} />
          <Route path="users/:id" element={<PublicProfilePage />} />
        </Route>
      </Routes>
    </>
  )
}
