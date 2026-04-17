/*
  Warnings:

  - You are about to alter the column `date` on the `customer_transactions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `unit` on the `customer_transactions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(40)`.

*/
-- AlterTable
ALTER TABLE `customer_transactions` MODIFY `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `unit` VARCHAR(40) NOT NULL;
