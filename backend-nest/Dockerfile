# Stage 1: Build
FROM node:18-alpine AS builder

# Tạo thư mục app
WORKDIR /usr/src/app

# Copy package.json và lock file trước để tối ưu cache
COPY package*.json ./

# Cài dependency
RUN npm install --legacy-peer-deps

# Copy toàn bộ source code
COPY . .

# Build NestJS (chuyển TS -> JS trong dist/)
RUN npm run build


# Stage 2: Run
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json để cài các dependency cần cho runtime
COPY package*.json ./

# Chỉ cài dependency production (giảm dung lượng)
RUN npm install --omit=dev --legacy-peer-deps

# Copy dist đã build từ stage 1
COPY --from=builder /usr/src/app/dist ./dist

# Copy file cấu hình (nếu có)
COPY --from=builder /usr/src/app/node_modules ./node_modules

# App chạy trên port 3000
EXPOSE 3000

# Lệnh chạy app
CMD ["node", "dist/main"]
