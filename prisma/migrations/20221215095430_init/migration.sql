/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `image` VARCHAR(255) NOT NULL,
    ADD COLUMN `time` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `username` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `Post`;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
