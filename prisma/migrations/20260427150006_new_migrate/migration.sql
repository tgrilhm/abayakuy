/*
  Warnings:

  - You are about to drop the column `stok` on the `products` table. All the data in the column will be lost.
  - The `ukuran` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `kategori` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('Outer Abaya', 'Instant Abaya', 'Luxe Kaftan', 'Luxe Chiffon', 'Velvet Abaya');

-- CreateEnum
CREATE TYPE "Ukuran" AS ENUM ('L', 'XL', '2XL', '3XL', '4XL', 'Free Size');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "stok",
ADD COLUMN     "isHeroFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "ukuran",
ADD COLUMN     "ukuran" "Ukuran"[],
DROP COLUMN "kategori",
ADD COLUMN     "kategori" "Kategori";
