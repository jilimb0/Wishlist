import { useState, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { Link } from "react-router-dom"
import {
  useUpdateProfile,
  useMyReservations,
  useCancelReservation,
  useUploadAvatar,
  useChangePassword,
  usePendingFriends,
  useRespondFriendRequest,
  useFriends,
  useInviteFriend,
  useSearchUsers,
  useDeleteProfile,
} from "@/hooks/api"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { UserAvatar } from "@/components/UserAvatar"
import { useI18n } from "@/i18n/context"
import { Input } from "@/components/Input"
import { Modal } from "@/components/Modal"

function InviteForm() {
  const [email, setEmail] = useState("")
  const [invited, setInvited] = useState(false)
  const invite = useInviteFriend()
  const { t } = useI18n()

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    isValid ? email : "",
  )
  const existingUser = Array.isArray(searchResults)
    ? searchResults.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    invite.mutate(email, {
      onSuccess: () => {
        setInvited(true)
        setEmail("")
        toast.success(t("profile.invite_success"))
        setTimeout(() => setInvited(false), 5000)
      },
      onError: () => toast.error(t("profile.invite_error")),
    })
  }

  return (
    <div className="space-y-4">
      <div className="min-h-[20px]">
        {email && !isValid ? (
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
            {t("profile.invalid_email")}
          </p>
        ) : isValid && !isSearching ? (
          <div className="animate-in fade-in slide-in-from-top-1">
            {existingUser ? (
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">
                {t("profile.user_found", { name: existingUser.displayName })}
              </p>
            ) : (
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                {t("profile.user_not_found_invite")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            {t("profile.invite")}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          error={email && !isValid}
          success={isValid && !!existingUser}
          rightElement={
            isSearching && (
              <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            )
          }
          required
        />
        {(isValid || invited) && (
          <button
            type="submit"
            disabled={invite.isPending}
            className={`px-5 py-2.5 ${
              existingUser
                ? "bg-brand-500 hover:bg-brand-600"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            } text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0 shadow-lg ${
              existingUser ? "shadow-brand-500/10" : ""
            }`}
          >
            {invite.isPending
              ? "..."
              : invited
                ? "✓"
                : existingUser
                  ? "Add"
                  : t("profile.invite_btn")}
          </button>
        )}
      </form>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const changePassword = useChangePassword()
  const reservations = useMyReservations()
  const cancelReservation = useCancelReservation()

  const friends = useFriends()
  const pendingFriends = usePendingFriends()
  const respondFriendRequest = useRespondFriendRequest()
  const deleteProfile = useDeleteProfile()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [saved, setSaved] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Password change state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordState, setPasswordState] = useState<
    "idle" | "loading" | "success"
  >("idle")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(
      { displayName },
      {
        onSuccess: (updatedUser) => {
          updateUser(updatedUser)
          setSaved(true)
          toast.success(t("profile.updated"))
          setTimeout(() => setSaved(false), 2000)
        },
      },
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatar.mutate(file, {
        onSuccess: (data) => {
          if (user) updateUser({ ...user, avatarUrl: data.avatarUrl })
          toast.success(t("profile.avatar_uploaded"))
        },
        onError: () => toast.error(t("profile.avatar_upload_error")),
      })
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswords()) return

    setPasswordState("loading")
    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordState("success")
          setOldPassword("")
          setNewPassword("")
          setConfirmPassword("")
          setTimeout(() => setPasswordState("idle"), 2000)
        },
        onError: (err: any) => {
          setPasswordState("idle")
          const message =
            err.response?.data?.message ||
            err.message ||
            "Failed to change password"
          setPasswordError(message)
        },
      },
    )
  }

  const validatePasswords = () => {
    setPasswordError(null)

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordError(t("profile.password_mismatch"))
      return false
    }
    if (oldPassword && newPassword && newPassword === oldPassword) {
      setPasswordError(t("profile.password_same_error"))
      return false
    }
    return true
  }

  const handleDeleteProfile = () => {
    deleteProfile.mutate(undefined, {
      onSuccess: () => {
        toast.success("Profile deleted successfully")
        navigate("/")
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete profile")
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* ─── Profile settings ──────────────────────── */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-zinc-100 uppercase tracking-tight">
          {t("profile.settings")}
        </h2>
        <div className="p-6 bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl space-y-6 shadow-xl">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <UserAvatar
                user={{ ...user, displayName }}
                size="xl"
                className="border-2 border-zinc-700 shadow-xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-300 backdrop-blur-[2px]"
              >
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Change
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadAvatar.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">{user?.email}</p>
              <p className="text-sm text-zinc-500">
                {t("profile.avatar_desc")}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="space-y-4 pt-4 border-t border-zinc-800"
          >
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                {t("profile.display_name")}
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="py-3.5 bg-brand-500 hover:bg-brand-600 text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-brand-500/10"
              >
                {saved
                  ? t("profile.save_success")
                  : updateProfile.isPending
                    ? t("common.loading")
                    : t("common.update")}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="py-3.5 bg-red-500/5 hover:bg-red-500/10 text-red-500/80 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 border border-red-500/10"
              >
                {t("common.delete")}
              </button>
            </div>
          </form>
        </div>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={t("profile.delete_account")}
          footer={
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleteProfile.isPending}
                className="px-6 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/10 disabled:opacity-50"
              >
                {deleteProfile.isPending
                  ? t("common.loading")
                  : t("profile.delete_btn")}
              </button>
            </div>
          }
        >
          <p>{t("profile.delete_confirm")}</p>
        </Modal>
      </section>

      {/* ─── Friends & Invites ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <section className="space-y-4 flex flex-col">
          <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight h-8">
            {t("profile.friends")}
          </h2>
          <div className="flex-1 p-6 bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl shadow-lg flex flex-col min-h-[320px]">
            {friends.isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-zinc-800/30 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : !friends.data?.length ? (
              <div className="flex-1 flex items-center justify-center p-8 grayscale opacity-20">
                <div className="text-center">
                  <span className="text-4xl block mb-2">👥</span>
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {t("profile.find_friends")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.data.map((friend: any) => (
                  <Link
                    key={friend.id}
                    to={`/users/${friend.id}`}
                    className="flex items-center gap-3 p-3 bg-zinc-800/30 border border-zinc-700/50 rounded-xl hover:border-zinc-700 transition-all active:scale-[0.98]"
                  >
                    <UserAvatar user={friend} size="sm" />
                    <span className="text-sm font-bold text-zinc-200">
                      {friend.displayName}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-zinc-800/50">
              <InviteForm />
            </div>
          </div>
        </section>

        <section className="space-y-4 flex flex-col">
          <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight h-8">
            {t("profile.requests")}
          </h2>
          <div className="flex-1 p-6 bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl shadow-lg flex flex-col min-h-[320px]">
            {!pendingFriends.data || pendingFriends.data.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 grayscale opacity-20">
                <div className="text-center">
                  <span className="text-4xl block mb-2">📩</span>
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {t("profile.no_requests")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFriends.data.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl space-y-3"
                  >
                    <Link
                      to={`/users/${req.user.id}`}
                      className="flex items-center gap-3 active:scale-95 transition-transform"
                    >
                      <UserAvatar user={req.user} size="sm" />
                      <span className="text-sm font-bold text-zinc-200">
                        {req.user.displayName}
                      </span>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          respondFriendRequest.mutate({
                            id: req.id,
                            accept: true,
                          })
                        }
                        className="flex-1 py-1.5 bg-brand-500 text-black text-[10px] font-black uppercase rounded-lg hover:bg-brand-600 transition-colors"
                      >
                        {t("profile.accept")}
                      </button>
                      <button
                        onClick={() =>
                          respondFriendRequest.mutate({
                            id: req.id,
                            accept: false,
                          })
                        }
                        className="flex-1 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        {t("profile.ignore")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ─── Change Password ───────────────────────── */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-zinc-100 uppercase tracking-tight">
          {t("profile.security")}
        </h2>
        <form
          onSubmit={handleChangePassword}
          className="space-y-4 p-6 bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl shadow-xl"
        >
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              {t("profile.current_password")}
            </label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              onBlur={validatePasswords}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                {t("profile.new_password")}
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={validatePasswords}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                {t("profile.confirm_password")}
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={validatePasswords}
                placeholder="••••••••"
              />
            </div>
          </div>
          {passwordError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {passwordError}
            </div>
          )}
          <button
            type="submit"
            disabled={passwordState === "loading"}
            className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-50 active:scale-95"
          >
            {passwordState === "success"
              ? `✓ ${t("profile.password_changed")}`
              : passwordState === "loading"
                ? t("profile.password_updating")
                : t("profile.update_password")}
          </button>
        </form>
      </section>

      {/* ─── My Reservations ───────────────────────── */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-zinc-100">
          {t("profile.reservations")}
        </h2>
        {reservations.isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : !reservations.data?.length ? (
          <div className="text-center py-10 text-zinc-500 bg-zinc-900/30 rounded-2xl border-2 border-zinc-800 border-dashed">
            {t("profile.no_reservations")}
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations.data.map((res: any) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-5 bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-zinc-100">{res.item.title}</h3>
                  <p className="text-[10px] uppercase tracking-wider font-black text-zinc-500 mt-1">
                    from{" "}
                    <span className="text-zinc-300">
                      {res.item.wishlist.title}
                    </span>{" "}
                    by{" "}
                    <span className="text-brand-400">
                      {res.item.wishlist.user.displayName}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => cancelReservation.mutate(res.id)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-400/5 border border-transparent hover:border-red-400/20 rounded-xl transition-all active:scale-95"
                >
                  {t("common.cancel")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
