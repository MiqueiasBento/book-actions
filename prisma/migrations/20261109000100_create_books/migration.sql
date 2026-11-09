CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "author" VARCHAR(100) NOT NULL,
    "publishedYear" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);
