#!/bin/bash

echo "🚀 Instalando melhorias do OMC Prod"
echo "======================================================"

# Criar estruturas de pastas
mkdir -p app/produtos
mkdir -p app/programas
mkdir -p app/relatorios
mkdir -p app/api/programs
mkdir -p app/api/products/all
mkdir -p app/api/products/[id]
mkdir -p app/api/reports
mkdir -p components/ui

echo "✅ Estrutura de pastas criada"

# Copiar páginas
echo "📄 Copiando páginas..."
cp products_management.tsx app/produtos/page.tsx
cp estoque_page_improved.tsx app/estoque/page.tsx
cp relatorios_page.tsx app/relatorios/page.tsx

# Copiar componentes
echo "🧩 Copiando componentes..."
cp purchase_form_final.tsx components/purchase-form.tsx
cp purchase_table_editable.tsx components/purchase-table.tsx
cp navbar_updated.tsx components/navbar.tsx
cp dialog_component.tsx components/ui/dialog.tsx

# Copiar APIs
echo "🔌 Copiando APIs..."
cp reports_api.ts app/api/reports/route.ts
cp programs_api.ts app/api/programs/route.ts
cp products_api_full.ts app/api/products/route.ts
cp products_api_all.ts app/api/products/all/route.ts
cp products_api_by_id.ts app/api/products/[id]/route.ts
cp stock_points_detailed_api.ts app/api/stock/points-to-receive/route.ts

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📦 Instale as dependências do Dialog:"
npm install @radix-ui/react-dialog

echo ""
echo "🎉 Tudo pronto! Reinicie o servidor:"
echo "  npm run dev"
echo ""
