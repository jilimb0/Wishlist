import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { useForgotPassword } from "../hooks/api"
import { toast } from "react-hot-toast"
import { Input } from "@/components/Input"

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>()
  const forgotPassword = useForgotPassword()
  const [success, setSuccess] = useState(false)

  const onSubmit = (data: { email: string }) => {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        setSuccess(true)
        toast.success("Reset instructions sent")
      },
      onError: () => {
        toast.error("Failed to send request")
      },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="mx-auto w-16 h-16 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/5">
            <svg
              className="w-8 h-8 text-brand-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Check your email
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              We have sent password reset instructions to your email address.
            </p>
          </div>
          <div className="pt-4">
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-bold transition-colors inline-flex items-center gap-2"
            >
              <span>&larr;</span> Return to sign in
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
          <p className="text-zinc-500 text-sm">
            Enter your email address to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1"
              >
                Email address
              </label>
              <Input
                id="email-address"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                error={!!errors.email}
                {...register("email", { required: true })}
              />
              {errors.email && (
                <span className="text-red-400 text-sm mt-1 ml-1 block animate-in fade-in slide-in-from-top-1">
                  Email is required
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotPassword.isPending}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/10 disabled:opacity-50"
          >
            {forgotPassword.isPending ? "Sending..." : "Send reset link"}
          </button>

          <div className="text-center mt-2">
            <Link
              to="/login"
              className="text-sm font-medium text-brand-400/80 hover:text-brand-400 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
