# ---------- Build Stage ----------
	FROM node:20-alpine AS builder

	WORKDIR /app
	
	COPY package*.json ./
	RUN npm ci
	
	COPY . .
	
	RUN npm run build
	
	
	# ---------- Runtime Stage ----------
	FROM node:20-alpine AS runner
	
	WORKDIR /app

	RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

	COPY --from=builder /app/dist ./dist
	COPY --from=builder /app/package*.json ./
	COPY --from=builder /app/package*.json ./
	COPY --from=builder /app/.env ./
	COPY --from=builder /app/tsconfig.json ./
	COPY --from=builder /app/tsconfig.json ./

	# Install only production deps
	RUN npm ci --omit=dev --ignore-scripts

	USER nestjs
	
	EXPOSE 3000
	
	CMD npm run start:prod
	