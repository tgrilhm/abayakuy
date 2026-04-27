/*
  Warnings:

  - The `bahan` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `warna` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Bahan" AS ENUM ('Premium Harrer', 'Tiktok', 'Harrer Suudi', 'Kursa', 'Siffon', 'Harrer', 'Velvet Bludru', 'Crepe', 'Satin');

-- CreateEnum
CREATE TYPE "Warna" AS ENUM ('Hitam', 'Krem', 'Coffe', 'Mint', 'Biru', 'Abu-abu', 'Merah', 'Coklat', 'Putih', 'Kuning', 'Ungu', 'Hijau', 'Hijau Botol', 'Broken White', 'Emerald');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "bahan",
ADD COLUMN     "bahan" "Bahan",
DROP COLUMN "warna",
ADD COLUMN     "warna" "Warna";
