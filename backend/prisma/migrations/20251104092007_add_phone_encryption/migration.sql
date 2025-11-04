/*
  Warnings:

  - Added the required column `phoneHash` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "email" TEXT,
    "optInSms" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Member" ("createdAt", "email", "firstName", "id", "lastName", "optInSms", "phone", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "lastName", "optInSms", "phone", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_phoneHash_key" ON "Member"("phoneHash");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE INDEX "Member_phoneHash_idx" ON "Member"("phoneHash");
CREATE INDEX "Member_email_idx" ON "Member"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
