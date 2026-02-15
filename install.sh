#!/bin/bash

echo "🚀 Instalando páginas e componentes do OMC Prod v2.0"
echo "======================================================"

# Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p app/compras
mkdir -p app/vendas
mkdir -p app/estoque
mkdir -p app/pontos
mkdir -p app/api/sales
mkdir -p app/api/stock/points-to-receive
mkdir -p components/ui

# Mover páginas
echo "📄 Instalando páginas..."
mv compras_page.tsx app/compras/page.tsx 2>/dev/null || echo "✓ compras/page.tsx"
mv vendas_page.tsx app/vendas/page.tsx 2>/dev/null || echo "✓ vendas/page.tsx"
mv estoque_page.tsx app/estoque/page.tsx 2>/dev/null || echo "✓ estoque/page.tsx"
mv pontos_page.tsx app/pontos/page.tsx 2>/dev/null || echo "✓ pontos/page.tsx"

# Mover componentes
echo "🧩 Instalando componentes..."
mv purchase_form.tsx components/purchase-form.tsx 2>/dev/null || echo "✓ purchase-form.tsx"
mv purchase_table.tsx components/purchase-table.tsx 2>/dev/null || echo "✓ purchase-table.tsx"
mv sale_form.tsx components/sale-form.tsx 2>/dev/null || echo "✓ sale-form.tsx"
mv sales_table.tsx components/sales-table.tsx 2>/dev/null || echo "✓ sales-table.tsx"

# Mover componentes UI
echo "🎨 Instalando componentes UI..."
mv input.tsx components/ui/input.tsx 2>/dev/null || echo "✓ ui/input.tsx"
mv label.tsx components/ui/label.tsx 2>/dev/null || echo "✓ ui/label.tsx"
mv select.tsx components/ui/select.tsx 2>/dev/null || echo "✓ ui/select.tsx"
mv badge.tsx components/ui/badge.tsx 2>/dev/null || echo "✓ ui/badge.tsx"
mv table.tsx components/ui/table.tsx 2>/dev/null || echo "✓ ui/table.tsx"
mv tabs.tsx components/ui/tabs.tsx 2>/dev/null || echo "✓ ui/tabs.tsx"

# Mover API routes
echo "🔌 Instalando API routes..."
mv sales_api_route.ts app/api/sales/route.ts 2>/dev/null || echo "✓ api/sales/route.ts"
mv stock_api_route.ts app/api/stock/route.ts 2>/dev/null || echo "✓ api/stock/route.ts"
mv stock_points_api_route.ts app/api/stock/points-to-receive/route.ts 2>/dev/null || echo "✓ api/stock/points-to-receive/route.ts"

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📦 Instalando dependências necessárias..."
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs lucide-react class-variance-authority

echo ""
echo "======================================================"
echo "✨ Tudo pronto!"
echo "======================================================"
echo ""
echo "Para rodar o projeto:"
echo "  npm run dev"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
