import { Input } from "@/components/Input"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useResetPassword } from "../hooks/api"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ password: string; confirmPassword: string }>()

  const resetPassword = useResetPassword()
  const navigate = useNavigate()

  const onSubmit = (data: { password: string }) => {
    if (!token) {
      toast.error("Missing reset token")
      return
    }

    resetPassword.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success("Password reset successfully")
          navigate("/login")
        },
        onError: () => {
          toast.error("Failed to reset password. Invalid or expired token.")
        },
      },
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/5">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Invalid link</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-red-500 tracking-tight">Invalid Link</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              This password reset link is invalid or missing a token. Please request a new one.
            </p>
          </div>
          <div className="pt-4">
            <Link
              to="/forgot-password"
              className="text-brand-400 hover:text-brand-300 font-bold transition-colors inline-flex items-center gap-2"
            >
              Request a new link <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">🎁</span>
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="bg-linear-to-br from-brand-300 via-brand-500 to-brand-600 bg-clip-text text-transparent">
                WishTracker
              </span>
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">Create a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1"
              >
                New Password
              </label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                error={!!errors.password}
                {...register("password", { required: true, minLength: 6 })}
              />
              {errors.password && (
                <span className="text-red-400 text-sm mt-1 ml-1 block animate-in fade-in slide-in-from-top-1">
                  Password must be at least 6 chars
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1"
              >
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                required
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                {...register("confirmPassword", {
                  required: true,
                  validate: (val) => {
                    if (watch("password") !== val) {
                      return "Your passwords do no match"
                    }
                  },
                })}
              />
              {errors.confirmPassword && (
                <span className="text-red-400 text-sm mt-1 ml-1 block animate-in fade-in slide-in-from-top-1">
                  Passwords do not match
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={resetPassword.isPending}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/10 disabled:opacity-50"
          >
            {resetPassword.isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
