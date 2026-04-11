-- Run once in MySQL/phpMyAdmin if `npx prisma db push` is blocked.
-- Adds PENDING and sets default; keeps existing SENT/PAID rows unchanged.

ALTER TABLE invoices
MODIFY COLUMN status ENUM('PENDING', 'SENT', 'PAID') NOT NULL DEFAULT 'PENDING';
