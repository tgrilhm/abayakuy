# Tahap 1: Build Frontend
FROM node:20-alpine as build-stage

WORKDIR /app

# Salin package file
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin kode frontend
COPY . .

# Build aplikasi menggunakan Vite
RUN npm run build

# Tahap 2: Production menggunakan Nginx
FROM nginx:stable-alpine as production-stage

# Salin hasil build dari tahap 1 ke folder default Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Tambahkan konfigurasi Nginx sederhana jika diperlukan untuk SPA (Single Page Application)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
