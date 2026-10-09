export * from "./affiliate"

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
  GROUP_GIFT_CONTRIBUTION = "GROUP_GIFT_CONTRIBUTION",
}

export enum ItemStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export enum SubscriptionTier {
  FREE = "FREE",
  PRO = "PRO",
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
  telegramChatId?: string | null
  telegramUsername?: string | null
  subscriptionTier?: SubscriptionTier | "FREE" | "PRO"
  trialEndsAt?: string | null
  proExpiresAt?: string | null
  isPro?: boolean
  friendshipId?: string
  friendship?: {
    id: string
    status: FriendshipStatus | "PENDING" | "ACCEPTED"
  } | null
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
  type?: string | null
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

export interface GroupGiftContribution {
  id: string
  itemId: string
  userId: string | null
  contributorName: string
  amount: number
  currency: string
  message: string | null
  createdAt: string
}

export interface Item {
  id: string
  wishlistId: string
  title: string
  description: string | null
  status: ItemStatus | "ACTIVE" | "COMPLETED"
  url: string
  affiliateUrl?: string | null
  imageUrl: string | null
  currentPrice: number | null
  currency: string
  trackPrice: boolean
  priority: number
  createdAt: string
  isGroupGift?: boolean
  targetAmount?: number | null
  fundraiserNote?: string | null
  fundraiserPaymentLink?: string | null
  contributions?: GroupGiftContribution[]
  totalContributed?: number
  contributionCount?: number
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
  item: Pick<Item, "id" | "title" | "url" | "imageUrl" | "currentPrice" | "currency"> & {
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
  type: NotificationType | "PRICE_DROP" | "NEW_ITEM" | "RESERVATION" | "GROUP_GIFT_CONTRIBUTION"
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

export interface BillingStatus {
  tier: SubscriptionTier | "FREE" | "PRO"
  isPro: boolean
  trialDaysRemaining: number
  proExpiresAt: string | null
  features: {
    unlimitedPriceTracking: boolean
    groupGifting: boolean
    customThemes: boolean
    prioritySupport: boolean
  }
}

// API Responses
export interface AuthResponse {
  user: User
  token: string
}
