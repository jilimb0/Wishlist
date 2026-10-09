-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_GIFT_CONTRIBUTION';

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "telegram_chat_id" VARCHAR(50),
ADD COLUMN "telegram_username" VARCHAR(100),
ADD COLUMN "telegram_link_token" VARCHAR(100),
ADD COLUMN "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN "trial_ends_at" TIMESTAMP(3),
ADD COLUMN "pro_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_link_token_key" ON "users"("telegram_link_token");

-- AlterTable
ALTER TABLE "items" ADD COLUMN "is_group_gift" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "target_amount" DECIMAL(10,2),
ADD COLUMN "fundraiser_note" TEXT,
ADD COLUMN "fundraiser_payment_link" TEXT;

-- CreateTable
CREATE TABLE "group_gift_contributions" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "user_id" UUID,
    "contributor_name" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_gift_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_gift_contributions_item_id_idx" ON "group_gift_contributions"("item_id");

-- CreateIndex
CREATE INDEX "group_gift_contributions_user_id_idx" ON "group_gift_contributions"("user_id");

-- AddForeignKey
ALTER TABLE "group_gift_contributions" ADD CONSTRAINT "group_gift_contributions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_gift_contributions" ADD CONSTRAINT "group_gift_contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
