// Enums (matching Prisma)
export enum Privacy {
  PRIVATE = "PRIVATE",
  FRIENDS = "FRIENDS",
  PUBLIC = "PUBLIC",
}

export enum ReservationStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  FULFILLED = "FULFILLED",
}

export enum NotificationType {
  PRICE_DROP = "PRICE_DROP",
  NEW_ITEM = "NEW_ITEM",
  RESERVATION = "RESERVATION",
}

export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

// Entities
export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  language: string
  currency: string
  createdAt: string
}

export interface Friendship {
  id: string
  userId: string
  friendId: string
  status: FriendshipStatus
  createdAt: string
  updatedAt: string
  user?: Pick<User, "id" | "displayName" | "avatarUrl">
  friend?: Pick<User, "id" | "displayName" | "avatarUrl">
}

export interface Invitation {
  id: string
  inviterId: string
  email: string
  token: string
  isUsed: boolean
  createdAt: string
  expiresAt: string
}

export interface Wishlist {
  id: string
  userId: string
  title: string
  description: string | null
  emoji: string
  privacy: Privacy | "PRIVATE" | "FRIENDS" | "PUBLIC" // Compatibility with string unions
  createdAt: string
  updatedAt: string
  user?: Pick<User, "id" | "displayName" | "avatarUrl">
  items?: Item[]
  _count?: { items: number }
  subscriptionId?: string
  subscriptionStatus?: string
}

export interface Item {
  id: string
  wishlistId: string
  title: string
  description: string | null
  url: string
  imageUrl: string | null
  currentPrice: number | null
  currency: string
  trackPrice: boolean
  priority: number
  createdAt: string
  reservation?: {
    id: string
    status: string
    isAnonymous?: boolean
    isReserved: boolean
    userId?: string
  } | null
}

export interface Reservation {
  id: string
  itemId: string
  userId: string
  isAnonymous: boolean
  status: ReservationStatus | "ACTIVE" | "CANCELLED" | "FULFILLED"
  createdAt: string
  item: Pick<
    Item,
    "id" | "title" | "url" | "imageUrl" | "currentPrice" | "currency"
  > & {
    wishlist: {
      id: string
      title: string
      user: Pick<User, "id" | "displayName">
    }
  }
}

export interface Subscription {
  id: string
  userId: string
  wishlistId: string
  notifyNewItems: boolean
  createdAt: string
  wishlist: Pick<Wishlist, "id" | "title" | "emoji" | "description"> & {
    _count: { items: number }
    user: Pick<User, "id" | "displayName" | "avatarUrl">
  }
}

export interface Notification {
  id: string
  type: NotificationType | "PRICE_DROP" | "NEW_ITEM" | "RESERVATION"
  title: string
  message: string
  relatedItemId: string | null
  isRead: boolean
  createdAt: string
}

export interface PriceHistory {
  id: string
  itemId: string
  price: number
  currency: string
  checkedAt: string
}

// API Responses
export interface AuthResponse {
  user: User
  token: string
}
