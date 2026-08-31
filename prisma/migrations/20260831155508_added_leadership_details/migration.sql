-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "LeadershipMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Executive Committee',
    "bio" TEXT,
    "imageUrl" TEXT NOT NULL DEFAULT '/assets/poster.jpg',
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadershipMember_pkey" PRIMARY KEY ("id")
);
