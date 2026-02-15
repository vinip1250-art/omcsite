#!/bin/bash

echo "🚀 Instalação Final - Sistema Completo"
echo "======================================================"
echo ""

# 1. Criar estruturas
echo "📁 Criando estrutura de pastas..."
mkdir -p app/contas app/programas app/lojas
mkdir -p app/api/accounts app/api/accounts/[id]
mkdir -p app/api/stores app/api/stores/[id]
mkdir -p app/api/programs/all app/api/programs/[id]

# 2. Copiar páginas
echo "📄 Copiando páginas..."
cp contas_page.tsx app/contas/page.tsx
cp lojas_page.tsx app/lojas/page.tsx
cp programas_updated_page.tsx app/programas/page.tsx
cp purchase_table_final.tsx components/purchase-table.tsx

# 3. Copiar APIs
echo "🔌 Copiando APIs..."
cp accounts_api.ts app/api/accounts/route.ts
cp accounts_api_by_id.ts app/api/accounts/[id]/route.ts
cp stores_api.ts app/api/stores/route.ts
cp stores_api_by_id.ts app/api/stores/[id]/route.ts
cp programs_api_updated.ts app/api/programs/route.ts
cp programs_api_all.ts app/api/programs/all/route.ts
cp programs_api_by_id.ts app/api/programs/[id]/route.ts

echo ""
echo "⚠️  IMPORTANTE: CONFIGURAR BANCO DE DADOS"
echo "======================================================"
echo ""
echo "1. Abra o arquivo do Prisma:"
echo "   nano prisma/schema.prisma"
echo ""
echo "2. Vá até o FINAL e cole o conteúdo de:"
echo "   prisma_schema_final.txt"
echo ""
echo "3. Execute a migration:"
echo "   npx prisma migrate dev --name add_accounts_stores_relation"
echo "   npx prisma generate"
echo ""
echo "4. Reinicie:"
echo "   npm run dev"
echo ""
echo "✅ Depois disso tudo vai funcionar!"
echo ""
