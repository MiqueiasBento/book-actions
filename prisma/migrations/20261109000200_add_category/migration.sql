ALTER TABLE "Book" ADD COLUMN "category" VARCHAR(50) NOT NULL DEFAULT 'geral';

UPDATE "Book" SET "category" = 'tecnologia' WHERE "title" = 'Clean Code';
