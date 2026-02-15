#!/bin/bash

echo "🚀 Instalando melhorias da aba COMPRAS"
echo "======================================================"

# Criar estruturas
mkdir -p app/contas
mkdir -p app/programas
mkdir -p app/api/accounts
mkdir -p app/api/accounts/[id]
mkdir -p app/api/programs/all
mkdir -p app/api/programs/[id]

# Copiar páginas
echo "📄 Copiando páginas..."
cp contas_page.tsx app/contas/page.tsx
cp programas_page.tsx app/programas/page.tsx

# Copiar componente atualizado
echo "🧩 Atualizando tabela de compras..."
cp purchase_table_final.tsx components/purchase-table.tsx

# Copiar APIs
echo "🔌 Copiando APIs..."
cp accounts_api.ts app/api/accounts/route.ts
cp accounts_api_by_id.ts app/api/accounts/[id]/route.ts
cp programs_api_updated.ts app/api/programs/route.ts
cp programs_api_all.ts app/api/programs/all/route.ts
cp programs_api_by_id.ts app/api/programs/[id]/route.ts

echo ""
echo "⚠️  ATENÇÃO: MIGRAÇÃO DO BANCO DE DADOS NECESSÁRIA"
echo "======================================================"
echo ""
echo "1. Atualize seu prisma/schema.prisma com o conteúdo de:"
echo "   prisma_schema_update.txt"
echo ""
echo "2. Execute a migration:"
echo "   npx prisma migrate dev --name add_accounts_and_store"
echo ""
echo "3. Ou execute o SQL manualmente:"
echo "   Veja o arquivo: migration.sql"
echo ""
echo "4. Depois rode:"
echo "   npm run dev"
echo ""
