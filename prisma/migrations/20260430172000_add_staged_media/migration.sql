CREATE TABLE "staged_media" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staged_media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "staged_media_token_key" ON "staged_media"("token");
CREATE INDEX "staged_media_expiresAt_idx" ON "staged_media"("expiresAt");
