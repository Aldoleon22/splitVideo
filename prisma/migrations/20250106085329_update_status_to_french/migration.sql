-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VideoProcessingQueue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "projectName" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'en attente',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoProcessingQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VideoProcessingQueue" ("createdAt", "id", "priority", "projectName", "resolution", "status", "updatedAt", "userId") SELECT "createdAt", "id", "priority", "projectName", "resolution", "status", "updatedAt", "userId" FROM "VideoProcessingQueue";
DROP TABLE "VideoProcessingQueue";
ALTER TABLE "new_VideoProcessingQueue" RENAME TO "VideoProcessingQueue";
CREATE INDEX "VideoProcessingQueue_status_priority_idx" ON "VideoProcessingQueue"("status", "priority");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
