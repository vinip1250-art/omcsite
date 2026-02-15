#!/bin/bash

# Script de Verificação de Arquivos - OMC Prod v2.0

echo "🔍 Verificando estrutura do projeto..."
echo "======================================"
echo ""

# Contador
total=0
ok=0
missing=0

# Função de verificação
check_file() {
    ((total++))
    if [ -f "$1" ]; then
        echo "✅ $1"
        ((ok++))
    else
        echo "❌ $1"
        ((missing++))
    fi
}

check_dir() {
    ((total++))
    if [ -d "$1" ]; then
        echo "✅ $1/"
        ((ok++))
    else
        echo "❌ $1/"
        ((missing++))
    fi
}

echo "📁 Diretórios:"
check_dir "app"
check_dir "app/api"
check_dir "app/api/products"
check_dir "app/api/purchases"
check_dir "components"
check_dir "components/ui"
check_dir "lib"
check_dir "prisma"
echo ""

echo "⚙️ Configuração:"
check_file "package.json"
check_file "tsconfig.json"
check_file "next.config.js"
check_file "tailwind.config.js"
check_file "postcss.config.js"
check_file "docker-compose.yml"
check_file ".gitignore"
echo ""

echo "🎨 App (Frontend):"
check_file "app/layout.tsx"
check_file "app/page.tsx"
check_file "app/globals.css"
echo ""

echo "🔌 API Routes:"
check_file "app/api/products/route.ts"
check_file "app/api/purchases/route.ts"
echo ""

echo "🧩 Componentes:"
check_file "components/ui/button.tsx"
check_file "components/ui/card.tsx"
echo ""

echo "🛠️ Utilitários:"
check_file "lib/prisma.ts"
check_file "lib/utils.ts"
echo ""

echo "🗄️ Prisma:"
check_file "prisma/schema.prisma"
check_file "prisma/seed.ts"
echo ""

echo "📝 Variáveis de Ambiente:"
if [ -f ".env" ]; then
    echo "✅ .env"
    ((ok++))
    ((total++))
elif [ -f ".env.local" ]; then
    echo "⚠️  .env.local (renomeie para .env)"
    ((ok++))
    ((total++))
else
    echo "❌ .env ou .env.local"
    ((missing++))
    ((total++))
fi
echo ""

echo "======================================"
echo "📊 Resultado:"
echo "   Total:    $total arquivos/pastas"
echo "   OK:       $ok ✅"
echo "   Faltando: $missing ❌"
echo "======================================"
echo ""

if [ $missing -eq 0 ]; then
    echo "🎉 Estrutura completa!"
    echo ""
    echo "Próximos passos:"
    echo "1. npm install"
    echo "2. npx prisma generate"
    echo "3. npx prisma migrate dev --name init"
    echo "4. npm run prisma:seed"
    echo "5. npm run dev"
else
    echo "⚠️  Estrutura incompleta!"
    echo ""
    echo "AÇÃO NECESSÁRIA:"
    echo "1. Apague esta pasta"
    echo "2. Baixe o omcprod-v2.tar.gz"
    echo "3. Extraia: tar -xzf omcprod-v2.tar.gz"
    echo "4. Execute este script novamente"
fi
echo ""
