/*
  Warnings:

  - You are about to drop the `book_image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "book_image";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "bookImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    CONSTRAINT "bookImage_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
