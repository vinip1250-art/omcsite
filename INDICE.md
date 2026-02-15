# 📦 OMC Prod v2.0 - Índice Completo do Projeto

## 🎯 O Que Foi Criado

Este é um **projeto Next.js 15 completo** pronto para rodar localmente com Docker e fazer deploy na Vercel.

---

## 📁 Estrutura de Arquivos Criados

### 🔧 Configuração Principal
- ✅ `package.json` - Todas as dependências (Next.js 15, Prisma, React 19, TypeScript)
- ✅ `tsconfig.json` - Configuração TypeScript
- ✅ `next.config.js` - Configuração Next.js
- ✅ `tailwind.config.js` - Configuração Tailwind CSS
- ✅ `postcss.config.js` - PostCSS
- ✅ `.gitignore` - Arquivos ignorados pelo Git
- ✅ `.env.local` - Variáveis de ambiente LOCAL
- ✅ `.env.example` - Template de variáveis

### 🐳 Docker
- ✅ `docker-compose.yml` - PostgreSQL containerizado
  - Porta: 5432
  - User: omcprod
  - Password: omcprod123
  - Database: omcprod

### 🗄️ Banco de Dados (Prisma)
- ✅ `prisma/schema.prisma` - Schema completo com 6 models:
  - **Product** - Modelos de iPhone
  - **Purchase** - Compras com todos os campos da planilha
  - **Stock** - Controle de estoque
  - **PointsProgram** - Programas de pontos/milhas
  - **PointsAccount** - Contas por programa
  - **MonthlyReport** - Relatórios mensais
- ✅ `prisma/seed.ts` - Script para popular banco inicial
- ✅ `lib/prisma.ts` - Cliente Prisma singleton

### 🎨 Frontend (App Router)
- ✅ `app/layout.tsx` - Layout global
- ✅ `app/page.tsx` - Página inicial com cards de navegação
- ✅ `app/globals.css` - Estilos globais com Tailwind

### 🔌 API Routes
- ✅ `app/api/products/route.ts` - CRUD de produtos
  - GET: Lista produtos
  - POST: Cria produto
- ✅ `app/api/purchases/route.ts` - CRUD de compras
  - GET: Lista compras (com filtros)
  - POST: Cria compra (com cálculo automático)

### 🧩 Componentes UI
- ✅ `components/ui/button.tsx` - Botão (shadcn/ui)
- ✅ `components/ui/card.tsx` - Card (shadcn/ui)
- ✅ `lib/utils.ts` - Funções utilitárias:
  - `formatCurrency()` - Formata R$
  - `formatDate()` - Formata datas
  - `calculateFinalCost()` - Calcula custo final
  - `calculateProfit()` - Calcula lucro
  - `getMonthCode()` - Gera código do mês (JAN25)

### 📚 Documentação
- ✅ `README.md` - Documentação completa (50+ linhas)
- ✅ `QUICKSTART.md` - Guia rápido de início
- ✅ `setup.sh` - Script de setup automático

---

## 🚀 Como Usar

### Opção 1: Setup Manual

```bash
# 1. Entrar na pasta
cd omcprod-v2

# 2. Instalar dependências
npm install

# 3. Iniciar PostgreSQL
npm run docker:up

# 4. Aguardar 10 segundos

# 5. Criar banco
npx prisma migrate dev --name init

# 6. Popular dados
npm run prisma:seed

# 7. Rodar projeto
npm run dev

# 8. Acessar
# http://localhost:3000
```

### Opção 2: Setup Automático

```bash
cd omcprod-v2
chmod +x setup.sh
./setup.sh
npm run dev
```

---

## 📊 Dados Iniciais (Seed)

Após rodar o seed, você terá:

### Produtos (10 modelos)
- iPhone 13 128GB Branco/Preto
- iPhone 14 128GB Branco/Preto
- iPhone 14 256GB Branco/Preto
- iPhone 15 128GB Branco/Preto
- iPhone 15 256GB Branco/Preto

### Programas de Pontos (6)
- Esfera (pontos)
- Livelo (pontos)
- Smiles (milhas)
- Azul (milhas)
- AA (milhas)
- LATAM (milhas)

### Contas (5 por programa = 30 contas)
- Miri
- Vini
- Lindy
- Milla
- Tony

### Estoque
- Zerado para todos os produtos
- Pronto para receber compras

---

## 🔌 Endpoints da API

### Produtos
```bash
# Listar todos
GET http://localhost:3000/api/products

# Criar novo
POST http://localhost:3000/api/products
{
  "name": "13 128 Branco",
  "model": "13",
  "storage": "128",
  "color": "Branco"
}
```

### Compras
```bash
# Listar todas
GET http://localhost:3000/api/purchases

# Filtrar por status
GET http://localhost:3000/api/purchases?status=PENDING

# Filtrar por conta
GET http://localhost:3000/api/purchases?account=Miri

# Criar nova compra
POST http://localhost:3000/api/purchases
{
  "productId": "clx...",
  "purchaseDate": "2025-01-15",
  "paidValue": 3500,
  "account": "Miri",
  "points": 50000,
  "thousand": 14,
  "cashback": 700
}
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Pronto para Usar
- [x] Setup completo do projeto
- [x] Docker Compose com PostgreSQL
- [x] Schema Prisma completo (6 models)
- [x] Seed com dados iniciais
- [x] API Routes funcionais
- [x] Página inicial com navegação
- [x] Componentes UI básicos
- [x] Cálculos automáticos (custo final)
- [x] Formatação de moeda/data

### 🚧 A Desenvolver (Próximas Sprints)
- [ ] Página de Compras (formulário + tabela)
- [ ] Página de Vendas
- [ ] Página de Estoque
- [ ] Página de Pontos/Milhas
- [ ] Dashboard com gráficos
- [ ] Filtros avançados
- [ ] Exportação Excel
- [ ] Relatórios mensais automáticos

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js** 15.1.4 (App Router)
- **React** 19.0.0
- **TypeScript** 5.7.2
- **Tailwind CSS** 3.4.17
- **shadcn/ui** (Radix UI)

### Backend
- **Next.js API Routes**
- **Prisma ORM** 5.20.0
- **PostgreSQL** 16

### Ferramentas
- **Docker** Compose
- **Zod** (validação)
- **React Hook Form** (formulários)
- **TanStack Table** (tabelas)
- **Recharts** (gráficos)

---

## 📝 Comandos Importantes

```bash
# Desenvolvimento
npm run dev              # Rodar servidor
npm run build            # Build produção
npm run start            # Produção

# Prisma
npm run prisma:studio    # Abrir editor visual
npm run prisma:generate  # Gerar client
npm run prisma:migrate   # Nova migration
npm run prisma:seed      # Popular banco

# Docker
npm run docker:up        # Ligar PostgreSQL
npm run docker:down      # Desligar PostgreSQL
npm run docker:reset     # Resetar tudo (⚠️)
```

---

## 🌐 Deploy na Vercel

### Passo a Passo

1. **Criar banco Vercel Postgres**
```bash
vercel postgres create
```

2. **Pegar URL do banco**
```bash
vercel env pull .env.production.local
```

3. **Adicionar variável no painel Vercel**
```
DATABASE_URL = postgresql://...
```

4. **Deploy**
```bash
vercel --prod
```

5. **Rodar migrations**
```bash
npx prisma migrate deploy
```

6. **Seed (opcional)**
```bash
npx prisma db seed
```

---

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
DATABASE_URL="postgresql://omcprod:omcprod123@localhost:5432/omcprod?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Produção (Vercel)
```env
DATABASE_URL="postgresql://user:pass@host.vercel.app:5432/db"
NEXT_PUBLIC_APP_URL="https://omcprod.vercel.app"
```

---

## 💡 Próximas Implementações

### Sprint 1 (Semana 1-2)
1. Página de Compras
   - Formulário completo
   - Validação Zod
   - Tabela com TanStack
   - Filtros por data/conta/status

2. Página de Vendas
   - Marcar como vendido
   - Cálculo de lucro automático
   - Histórico de vendas

### Sprint 2 (Semana 3-4)
3. Dashboard
   - KPIs principais
   - Gráficos Recharts
   - Resumo mensal

4. Gestão de Estoque
   - Atualização automática
   - Alertas de baixo estoque
   - Controle a caminho/em estoque

### Sprint 3 (Semana 5-6)
5. Pontos e Milhas
   - Visualização por programa
   - Saldo por conta
   - Pontos a receber

6. Relatórios
   - Exportação Excel
   - Relatório mensal automático
   - Comparativo de períodos

---

## 🐛 Troubleshooting

### Porta 5432 ocupada?
```bash
# Mude para 5433 no docker-compose.yml e .env.local
```

### Erro ao conectar banco?
```bash
npm run docker:reset
```

### Prisma Client desatualizado?
```bash
npx prisma generate
```

### Migration pendente?
```bash
npx prisma migrate dev
```

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique o README.md
2. Consulte o QUICKSTART.md
3. Rode `npm run prisma:studio` para ver o banco
4. Verifique logs: `docker-compose logs`

---

## 🎉 Status do Projeto

**Versão**: 2.0.0  
**Status**: ✅ MVP Pronto para Desenvolvimento Local  
**Próximo Passo**: Implementar Página de Compras  
**Deploy**: 🟡 Aguardando implementação das features  

---

**Criado em**: Fevereiro 2026  
**Por**: Sistema OMC Prod - Gestão de Revenda
