/*
  Warnings:

  - The primary key for the `Test` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Test` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_testId_fkey";

-- DropIndex
DROP INDEX "Test_code_key";

-- AlterTable
ALTER TABLE "Log" ALTER COLUMN "testId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Test" DROP CONSTRAINT "Test_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Test_pkey" PRIMARY KEY ("code");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
