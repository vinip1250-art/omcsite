#!/bin/bash

echo "🔍 DIAGNÓSTICO DO PROJETO OMC PROD"
echo "======================================================"
echo ""

# Verificar estrutura de pastas
echo "📁 Verificando estrutura de pastas..."
echo ""

folders=(
  "app/compras"
  "app/vendas"
  "app/estoque"
  "app/pontos"
  "app/api/sales"
  "app/api/stock"
  "app/api/stock/points-to-receive"
  "components"
  "components/ui"
)

for folder in "${folders[@]}"; do
  if [ -d "$folder" ]; then
    echo "✅ $folder"
  else
    echo "❌ $folder - FALTANDO"
    mkdir -p "$folder"
    echo "   📁 Pasta criada!"
  fi
done

echo ""
echo "📄 Verificando arquivos das páginas..."
echo ""

# Verificar páginas
if [ -f "app/compras/page.tsx" ]; then
  echo "✅ app/compras/page.tsx"
else
  echo "❌ app/compras/page.tsx - FALTANDO!"
fi

if [ -f "app/vendas/page.tsx" ]; then
  echo "✅ app/vendas/page.tsx"
else
  echo "❌ app/vendas/page.tsx - FALTANDO!"
fi

if [ -f "app/estoque/page.tsx" ]; then
  echo "✅ app/estoque/page.tsx"
else
  echo "❌ app/estoque/page.tsx - FALTANDO!"
fi

if [ -f "app/pontos/page.tsx" ]; then
  echo "✅ app/pontos/page.tsx"
else
  echo "❌ app/pontos/page.tsx - FALTANDO!"
fi

echo ""
echo "🔧 Verificando componentes..."
echo ""

components=(
  "components/navbar.tsx"
  "components/purchase-form.tsx"
  "components/purchase-table.tsx"
  "components/sale-form.tsx"
  "components/sales-table.tsx"
)

for comp in "${components[@]}"; do
  if [ -f "$comp" ]; then
    echo "✅ $comp"
  else
    echo "❌ $comp - FALTANDO!"
  fi
done

echo ""
echo "🎨 Verificando componentes UI..."
echo ""

ui_components=(
  "components/ui/input.tsx"
  "components/ui/label.tsx"
  "components/ui/select.tsx"
  "components/ui/badge.tsx"
  "components/ui/table.tsx"
  "components/ui/tabs.tsx"
)

for ui_comp in "${ui_components[@]}"; do
  if [ -f "$ui_comp" ]; then
    echo "✅ $ui_comp"
  else
    echo "❌ $ui_comp - FALTANDO!"
  fi
done

echo ""
echo "🔌 Verificando API Routes..."
echo ""

if [ -f "app/api/sales/route.ts" ]; then
  echo "✅ app/api/sales/route.ts"
else
  echo "❌ app/api/sales/route.ts - FALTANDO!"
fi

if [ -f "app/api/stock/route.ts" ]; then
  echo "✅ app/api/stock/route.ts"
else
  echo "❌ app/api/stock/route.ts - FALTANDO!"
fi

if [ -f "app/api/stock/points-to-receive/route.ts" ]; then
  echo "✅ app/api/stock/points-to-receive/route.ts"
else
  echo "❌ app/api/stock/points-to-receive/route.ts - FALTANDO!"
fi

echo ""
echo "======================================================"
echo "📝 AÇÕES NECESSÁRIAS:"
echo "======================================================"
echo ""
echo "Se algum arquivo estiver FALTANDO, copie manualmente:"
echo ""
echo "PÁGINAS:"
echo "  cp compras_page.tsx app/compras/page.tsx"
echo "  cp vendas_page.tsx app/vendas/page.tsx"
echo "  cp estoque_page.tsx app/estoque/page.tsx"
echo "  cp pontos_page.tsx app/pontos/page.tsx"
echo ""
echo "COMPONENTES:"
echo "  cp navbar.tsx components/navbar.tsx"
echo "  cp purchase_form.tsx components/purchase-form.tsx"
echo "  cp purchase_table.tsx components/purchase-table.tsx"
echo "  cp sale_form.tsx components/sale-form.tsx"
echo "  cp sales_table.tsx components/sales-table.tsx"
echo ""
echo "UI COMPONENTS:"
echo "  cp input.tsx components/ui/input.tsx"
echo "  cp label.tsx components/ui/label.tsx"
echo "  cp select.tsx components/ui/select.tsx"
echo "  cp badge.tsx components/ui/badge.tsx"
echo "  cp table.tsx components/ui/table.tsx"
echo "  cp tabs.tsx components/ui/tabs.tsx"
echo ""
echo "API ROUTES:"
echo "  cp sales_api_route.ts app/api/sales/route.ts"
echo "  cp stock_api_route.ts app/api/stock/route.ts"
echo "  cp stock_points_api_route.ts app/api/stock/points-to-receive/route.ts"
echo ""
echo "LAYOUT:"
echo "  cp layout_updated.tsx app/layout.tsx"
echo ""
