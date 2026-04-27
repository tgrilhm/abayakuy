-- Step 1: Add a temporary array column
ALTER TABLE "products" ADD COLUMN "warna_new" "Warna"[];

-- Step 2: Copy existing single value into the new array column
--         Wrap the old value in an array, casting via text to avoid direct enum cast issues
UPDATE "products"
SET "warna_new" = ARRAY["warna"::"Warna"]
WHERE "warna" IS NOT NULL;

-- Step 3: Drop the old scalar column
ALTER TABLE "products" DROP COLUMN "warna";

-- Step 4: Rename the new column to warna
ALTER TABLE "products" RENAME COLUMN "warna_new" TO "warna";
