# Gunakan Node.js 20 Alpine yang ringan
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi (hanya production untuk efisiensi jika perlu, tapi kita butuh devDeps untuk build prisma)
RUN npm install

# Salin sisa kode aplikasi (kecuali yang di .dockerignore)
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port backend
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
