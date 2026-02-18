FROM node:20-alpine AS base

# Dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Crie a pasta public se não existir
RUN mkdir -p public

# Instale OpenSSL para o Prisma
RUN apk add --no-cache openssl

# Gerar Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build da aplicação
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instale OpenSSL no runner também
RUN apk add --no-cache openssl libssl3

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Crie a estrutura de diretórios
RUN mkdir -p .next public

# Copie public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copie o standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copie prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["sh", "-c", "node prisma/migrate.js && node server.js"]
