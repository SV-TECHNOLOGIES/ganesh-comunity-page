-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "TeluguBusiness" ADD COLUMN     "googleMapsUrl" TEXT;

-- CreateTable
CREATE TABLE "MediaDownloadLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "mediaId" TEXT,
    "fileCount" INTEGER NOT NULL DEFAULT 1,
    "downloadType" TEXT NOT NULL DEFAULT 'SINGLE',
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaDownloadLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaDownloadLog_userId_idx" ON "MediaDownloadLog"("userId");

-- CreateIndex
CREATE INDEX "MediaDownloadLog_eventId_idx" ON "MediaDownloadLog"("eventId");

-- CreateIndex
CREATE INDEX "MediaDownloadLog_mediaId_idx" ON "MediaDownloadLog"("mediaId");

-- CreateIndex
CREATE INDEX "MediaDownloadLog_createdAt_idx" ON "MediaDownloadLog"("createdAt");

-- AddForeignKey
ALTER TABLE "MediaDownloadLog" ADD CONSTRAINT "MediaDownloadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaDownloadLog" ADD CONSTRAINT "MediaDownloadLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaDownloadLog" ADD CONSTRAINT "MediaDownloadLog_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
