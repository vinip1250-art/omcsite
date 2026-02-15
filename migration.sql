-- Migration para adicionar Account e atualizar PointsProgram

-- Criar tabela Account
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERSON',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- Adicionar campo store ao PointsProgram
ALTER TABLE "PointsProgram" ADD COLUMN "store" TEXT;

-- Inserir contas padrão
INSERT INTO "Account" ("id", "name", "type", "active", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Miri', 'PERSON', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Vini', 'PERSON', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Lindy', 'PERSON', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Milla', 'PERSON', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Tony', 'PERSON', true, NOW(), NOW());
