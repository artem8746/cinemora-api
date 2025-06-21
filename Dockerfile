# ---------- Build Stage ----------
	FROM node:18-alpine AS builder

	WORKDIR /app
	
	COPY package*.json ./
	RUN npm ci
	
	COPY . .
	
	RUN npm run build
	
	
	# ---------- Runtime Stage ----------
	FROM node:18-alpine AS runner
	
	WORKDIR /app
	
	RUN addgroup --system --gid 1001 nodejs && \
			adduser --system --uid 1001 nestjs
	
	COPY --from=builder /app/dist ./dist
	COPY --from=builder /app/node_modules ./node_modules
	COPY --from=builder /app/package*.json ./
	
	USER nestjs
	
	ENV NODE_ENV=production
	
	EXPOSE 3000
	
	CMD ["node", "dist/main"]
	