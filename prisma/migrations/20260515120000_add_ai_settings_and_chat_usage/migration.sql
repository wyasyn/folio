-- CreateTable
CREATE TABLE "SiteAiSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "chatModel" TEXT NOT NULL DEFAULT 'openai/gpt-4o-mini',
    "chatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatUsageLog" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatUsageLog_createdAt_idx" ON "ChatUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "ChatUsageLog_model_idx" ON "ChatUsageLog"("model");
