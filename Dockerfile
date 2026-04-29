# Gunakan Node.js 20 Alpine yang ringan
FROM node:20-alpine

# Install library yang dibutuhkan Prisma (openssl & libc6-compat) dan ffmpeg untuk video
RUN apk add --no-cache openssl libc6-compat ffmpeg

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin sisa kode aplikasi
COPY . .

# Generate Prisma Client (sekarang akan sukses karena openssl sudah ada)
RUN npx prisma generate

# Expose port backend
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
