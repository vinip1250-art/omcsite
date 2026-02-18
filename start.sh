#!/bin/sh
echo "=== Inicializando OMC Site ==="

# Cria tabelas essenciais se não existirem
npx prisma db push --schema=./prisma/schema.prisma --skip-generate || {
  echo "Criando tabelas básicas manualmente..."
  psql $DATABASE_URL -c "
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "email" TEXT UNIQUE,
      "password" TEXT,
      "name" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" TEXT NOT NULL,
      "model" TEXT,
      "storage" TEXT,
      "color" TEXT,
      "active" BOOLEAN DEFAULT true,
      "created
