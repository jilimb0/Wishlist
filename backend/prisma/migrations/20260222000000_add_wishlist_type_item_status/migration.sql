-- Add enum for item completion status
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- Add optional wishlist type
ALTER TABLE "wishlists"
ADD COLUMN "type" VARCHAR(100);

-- Add item status with default ACTIVE
ALTER TABLE "items"
ADD COLUMN "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE';
