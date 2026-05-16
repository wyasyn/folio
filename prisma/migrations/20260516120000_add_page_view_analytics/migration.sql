-- CreateEnum
CREATE TYPE "AnalyticsResourceType" AS ENUM ('home', 'profile', 'blog', 'blog_post', 'project', 'news', 'news_item', 'contact', 'uses', 'other');

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "resourceType" "AnalyticsResourceType" NOT NULL,
    "resourceId" TEXT,
    "slug" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "deviceType" TEXT,
    "sessionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_resourceType_createdAt_idx" ON "PageView"("resourceType", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_resourceId_createdAt_idx" ON "PageView"("resourceId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_slug_resourceType_idx" ON "PageView"("slug", "resourceType");

-- CreateIndex
CREATE INDEX "PageView_sessionKey_createdAt_idx" ON "PageView"("sessionKey", "createdAt");
