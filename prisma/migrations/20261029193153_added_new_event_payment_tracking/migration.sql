-- AlterTable
ALTER TABLE "EventRSVP" ADD COLUMN     "bundleId" TEXT,
ADD COLUMN     "ticketTierId" TEXT,
ADD COLUMN     "tierSelections" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "bundleId" TEXT,
ADD COLUMN     "rsvpId" TEXT,
ADD COLUMN     "ticketTierId" TEXT,
ADD COLUMN     "tierSelections" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "TeluguBusiness" ADD COLUMN     "instagram" TEXT;

-- CreateTable
CREATE TABLE "ticket_tiers" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "bookingFee" DECIMAL(10,2) DEFAULT 0.00,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "capacity" INTEGER,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowDirectBooking" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundles" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bundlePrice" DECIMAL(10,2) NOT NULL,
    "bookingFee" DECIMAL(10,2) DEFAULT 0.00,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "capacity" INTEGER,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_items" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "ticketTierId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "bundle_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_tiers_eventId_idx" ON "ticket_tiers"("eventId");

-- CreateIndex
CREATE INDEX "bundles_eventId_idx" ON "bundles"("eventId");

-- CreateIndex
CREATE INDEX "bundle_items_bundleId_idx" ON "bundle_items"("bundleId");

-- CreateIndex
CREATE INDEX "bundle_items_ticketTierId_idx" ON "bundle_items"("ticketTierId");

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_tiers" ADD CONSTRAINT "ticket_tiers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
