# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend and combine
FROM node:20-alpine
WORKDIR /app

# Install prisma (needed for the binary)
RUN apk add --no-cache openssl

# Copy backend dependencies
COPY package*.json ./
RUN npm install --production

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy backend source
COPY src ./src
COPY api ./api

# Create uploads directory
RUN mkdir -p public/uploads

# Copy frontend build from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
