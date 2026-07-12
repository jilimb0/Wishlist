import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Input } from "@/components/Input"
import { useAuth } from "@/context/AuthContext"
import { useInvitationPreview, useRegister } from "@/hooks/api"

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get("token") || ""
  const invitation = useInvitationPreview(inviteToken)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()
  const registerMutation = useRegister()

  useEffect(() => {
    if (invitation.data?.email) setEmail(invitation.data.email)
  }, [invitation.data?.email])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    registerMutation.mutate(
      { email, password, displayName, inviteToken: inviteToken || undefined },
      {
        onSuccess: (data: Record<string, unknown>) => {
          login(data.token, data.user)
          navigate("/")
        },
        onError: (err: Error) => setError(err.message),
      },
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
          <p className="text-zinc-500 text-sm">Create your account</p>
          {invitation.data?.inviter && (
            <p className="text-brand-400 text-xs mt-2">
              Invited by {invitation.data.inviter.displayName}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2 text-sm animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1"
              >
                Display Name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/10 disabled:opacity-50"
          >
            {registerMutation.isPending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
