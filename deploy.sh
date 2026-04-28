#!/bin/bash

# Update code
git pull origin main

# Install dependencies
npm install
npm run frontend:install

# Generate Prisma Client
npx prisma generate

# Build Frontend
npm run frontend:build

# Apply Database Migrations
npx prisma migrate deploy

# Restart Application (choose one)
# For PM2:
pm2 restart ecosystem.config.cjs --env production

# For Docker:
# docker-compose up -d --build

echo "Deployment completed successfully!"
