import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type {
  AuthResponse,
  Item,
  Notification,
  PriceHistory,
  Reservation,
  Subscription,
  User,
  Wishlist,
} from "../types"

// ─── Auth ─────────────────────────────────────────────────

export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; displayName: string }) =>
      api.post<AuthResponse>("/auth/register", data),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthResponse>("/auth/login", data),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
  })
}

// ─── Users ────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<User>("/users/me"),
    retry: false,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      displayName?: string
      avatarUrl?: string
      language?: string
      currency?: string
    }) => api.patch<User>("/users/me", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] })
    },
  })
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.get<Pick<User, "id" | "displayName" | "avatarUrl">>(`/users/${userId}`),
  })
}

// ─── Wishlists ────────────────────────────────────────────

export function useMyWishlists() {
  return useQuery({
    queryKey: ["wishlists"],
    queryFn: () => api.get<Wishlist[]>("/wishlists"),
  })
}

export function useWishlist(id: string) {
  return useQuery({
    queryKey: ["wishlist", id],
    queryFn: () => api.get<Wishlist & { items: Item[] }>(`/wishlists/${id}`),
    enabled: !!id,
  })
}

export function useCreateWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      type?: string
      description?: string
      emoji?: string
      privacy: string
    }) => api.post<Wishlist>("/wishlists", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlists"] }),
  })
}

export function useUpdateWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      title?: string
      description?: string
      emoji?: string
      privacy?: string
    }) => api.patch<Wishlist>(`/wishlists/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["wishlists"] })
      qc.invalidateQueries({ queryKey: ["wishlist", vars.id] })
    },
  })
}

export function useDeleteWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/wishlists/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlists"] }),
  })
}

// ─── Items ────────────────────────────────────────────────

export function useAddItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      wishlistId,
      ...data
    }: {
      wishlistId: string
      url: string
      title?: string
      imageUrl?: string
      price?: number
      currency?: string
      status?: "ACTIVE" | "COMPLETED"
    }) => api.post<Item>(`/wishlists/${wishlistId}/items`, data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["wishlist", vars.wishlistId] }),
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const { id, wishlistId, ...rest } = data
      return api.patch(`/items/${id}`, rest)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] })
    },
  })
}

interface RNFile {
  uri: string
  name: string
  type: string
}

export function useUploadItemImage() {
  return useMutation({
    mutationFn: async (file: RNFile) => {
      const formData = new FormData()
      // @ts-expect-error - React Native FormData expects an object with uri, name, type
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      })
      const response = await api.post<{ imageUrl: string }>("/items/upload", formData)
      return response
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}

export function usePriceHistory(itemId: string) {
  return useQuery({
    queryKey: ["priceHistory", itemId],
    queryFn: () => api.get<PriceHistory[]>(`/items/${itemId}/price-history`),
    enabled: !!itemId,
  })
}

// ─── Scraper ──────────────────────────────────────────────

export function useScrape() {
  return useMutation({
    mutationFn: (url: string) =>
      api.post<{
        title: string
        price: number | null
        currency: string
        imageUrl: string | null
        description: string | null
      }>("/scrape", { url }),
  })
}

// ─── Reservations ─────────────────────────────────────────

export function useReserveItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, isAnonymous }: { itemId: string; isAnonymous?: boolean }) =>
      api.post(`/items/${itemId}/reserve`, { isAnonymous }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}

export function useCancelReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] })
      qc.invalidateQueries({ queryKey: ["wishlist"] })
    },
  })
}

export function useMyReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: () => api.get<Reservation[]>("/reservations/my"),
  })
}

// ─── Subscriptions ────────────────────────────────────────

export function useSubscribe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      wishlistId,
      notifyNewItems,
    }: {
      wishlistId: string
      notifyNewItems?: boolean
    }) => api.post(`/wishlists/${wishlistId}/subscribe`, { notifyNewItems }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] })
      qc.invalidateQueries({ queryKey: ["wishlist"] })
    },
  })
}

export function useUnsubscribe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/subscriptions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] })
      qc.invalidateQueries({ queryKey: ["wishlist"] })
    },
  })
}

export function useMySubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => api.get<Subscription[]>("/subscriptions"),
  })
}

export function usePendingSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions", "pending"],
    queryFn: () => api.get<Array<Record<string, unknown>>>("/subscriptions/pending"),
  })
}

export function useApproveSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/subscriptions/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions", "pending"] })
    },
  })
}

export function useRejectSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/subscriptions/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions", "pending"] })
    },
  })
}

// ─── Notifications ────────────────────────────────────────

export function useNotifications(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["notifications", limit, offset],
    queryFn: () =>
      api.get<{ notifications: Notification[]; total: number }>(
        `/notifications?limit=${limit}&offset=${offset}`,
      ),
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

// ─── Discover ─────────────────────────────────────────────

export function useDiscover(search?: string, limit = 20) {
  return useQuery({
    queryKey: ["discover", search, limit],
    queryFn: () =>
      api.get<{ wishlists: Wishlist[]; total: number }>(
        `/discover?search=${search || ""}&limit=${limit}`,
      ),
  })
}

export function useDiscoverByUser(userId: string) {
  return useQuery({
    queryKey: ["discover", userId],
    queryFn: () => api.get<Wishlist[]>(`/discover/user/${userId}`),
    enabled: !!userId,
  })
}

// ─── Password Recovery ────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.post<{ message: string }>("/auth/forgot-password", data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      api.post<{ message: string }>("/auth/reset-password", data),
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: RNFile) => {
      const formData = new FormData()
      // @ts-expect-error
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      })
      return api.post<{ avatarUrl: string }>("/users/me/avatar", formData)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { oldPassword?: string; newPassword: string }) =>
      api.post("/auth/change-password", data),
  })
}

// ─── Friends ──────────────────────────────────────────────

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: () => api.get<User[]>("/friends/me"),
  })
}

export function usePendingFriends() {
  return useQuery({
    queryKey: ["friends", "pending"],
    queryFn: () => api.get<Array<Record<string, unknown>>>("/friends/pending"),
  })
}

export function useSendFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (friendId: string) => api.post(`/friends/request/${friendId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends", "pending"] }),
  })
}

export function useRespondFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      api.post(`/friends/respond/${id}`, { accept }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] })
      qc.invalidateQueries({ queryKey: ["friends", "pending"] })
    },
  })
}

export function useCancelFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/friends/request/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends", "pending"] })
    },
  })
}

export function useRemoveFriendship() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (friendshipId: string) => api.delete(`/friends/${friendshipId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] })
      qc.invalidateQueries({ queryKey: ["friends", "pending"] })
    },
  })
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => api.get<User[]>(`/friends/search?q=${query}`),
    enabled: !!query,
  })
}

export function useInviteFriend() {
  return useMutation({
    mutationFn: (email: string) => api.post("/friends/invite", { email }),
  })
}

// ─── Subscription Aliases ─────────────────────────────────
// Clearer names for subscription operations

export function useSubscribeToWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (wishlistId: string) =>
      api.post(`/wishlists/${wishlistId}/subscribe`, { notifyNewItems: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] })
      qc.invalidateQueries({ queryKey: ["wishlist"] })
      qc.invalidateQueries({ queryKey: ["following"] })
    },
  })
}

export function useUnsubscribeFromWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (subscriptionId: string) => api.delete(`/subscriptions/${subscriptionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] })
      qc.invalidateQueries({ queryKey: ["wishlist"] })
      qc.invalidateQueries({ queryKey: ["following"] })
    },
  })
}
