#!/bin/bash

echo "🗄️  Configurando banco de dados..."
echo ""
echo "Copie e cole este código no FINAL do arquivo prisma/schema.prisma:"
echo ""
cat << 'EOF'

// Contas (Miri, Vini, Lindy, etc)
model Account {
  id        String   @id @default(cuid())
  name      String
  type      String   @default("PERSON")
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Lojas/Clubes (Fast Shop, Casas Bahia, PagBank, etc)
model Store {
  id        String   @id @default(cuid())
  name      String   @unique
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

EOF

echo ""
echo "Depois execute:"
echo "  npx prisma migrate dev --name add_accounts_and_stores"
echo "  npx prisma generate"
echo ""
