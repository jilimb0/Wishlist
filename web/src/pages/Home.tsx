import { useMyWishlists } from "@/hooks/api"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const navigate = useNavigate()
  const wishlists = useMyWishlists()

  useEffect(() => {
    if (wishlists.isLoading) return

    const list = wishlists.data || []
    if (!list.length) {
      navigate("/lists", { replace: true })
      return
    }

    const lastActiveWishlistId = localStorage.getItem("lastActiveWishlistId")
    const target =
      list.find((wl) => wl.id === lastActiveWishlistId)?.id ||
      list[0]?.id

    if (target) {
      navigate(`/wishlists/${target}`, { replace: true })
      return
    }

    navigate("/lists", { replace: true })
  }, [wishlists.isLoading, wishlists.data, navigate])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
