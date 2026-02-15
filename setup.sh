#!/bin/bash

# 🚀 Script de Setup Automático - OMC Prod v2.0
# Execute este script para configurar o projeto automaticamente

echo "🚀 Iniciando setup do OMC Prod v2.0..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale Docker primeiro."
    exit 1
fi

echo "✅ Docker encontrado: $(docker --version)"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker Compose encontrado: $(docker-compose --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"
echo ""

# Copiar .env.example para .env.local
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado"
else
    echo "ℹ️  Arquivo .env.local já existe, pulando..."
fi
echo ""

# Iniciar Docker
echo "🐳 Iniciando PostgreSQL com Docker..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Erro ao iniciar Docker"
    exit 1
fi

echo "✅ PostgreSQL iniciado"
echo ""

# Aguardar PostgreSQL inicializar
echo "⏳ Aguardando PostgreSQL inicializar (10 segundos)..."
sleep 10

# Executar migrations
echo "🗄️  Executando migrations do Prisma..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar migrations"
    exit 1
fi

echo "✅ Migrations executadas"
echo ""

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Erro ao gerar Prisma Client"
    exit 1
fi

echo "✅ Prisma Client gerado"
echo ""

# Executar seed
echo "🌱 Populando banco de dados com dados iniciais..."
npm run prisma:seed

if [ $? -ne 0 ]; then
    echo "⚠️  Aviso: Erro ao executar seed, mas você pode continuar"
fi

echo "✅ Seed executado"
echo ""

# Sucesso
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "Para iniciar o servidor de desenvolvimento, execute:"
echo "  npm run dev"
echo ""
echo "Para visualizar o banco de dados no Prisma Studio, execute:"
echo "  npm run prisma:studio"
echo ""
echo "Acesse o sistema em: http://localhost:3000"
echo ""
