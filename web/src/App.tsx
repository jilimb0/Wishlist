import { Toaster } from "react-hot-toast"
import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import DashboardPage from "./pages/Dashboard"
import DiscoverPage from "./pages/Discover"
import FollowingPage from "./pages/Following"
import ForgotPasswordPage from "./pages/ForgotPassword"
import HomePage from "./pages/Home"
import LoginPage from "./pages/Login"
import ProfilePage from "./pages/Profile"
import PublicProfilePage from "./pages/PublicProfile"
import RegisterPage from "./pages/Register"
import ResetPasswordPage from "./pages/ResetPassword"
import WishlistDetailPage from "./pages/WishlistDetail"

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.25)",
          },
          success: {
            iconTheme: {
              primary: "#ffc107",
              secondary: "#18181b",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
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
          <Route index element={<HomePage />} />
          <Route path="lists" element={<DashboardPage />} />
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
