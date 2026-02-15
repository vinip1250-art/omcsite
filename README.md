# 🚀 OMC Prod v2.0

Sistema completo de gestão de revenda desenvolvido com Next.js 15, TypeScript, Prisma e PostgreSQL.

## 📋 Funcionalidades

- ✅ Gestão de Compras (registro completo com pontos, cashback, descontos)
- ✅ Controle de Vendas e cálculo automático de lucro
- ✅ Gestão de Estoque em tempo real
- ✅ Controle de Pontos/Milhas de múltiplos programas
- ✅ Relatórios mensais automáticos
- ✅ Dashboard com KPIs e gráficos
- ✅ Exportação de dados

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Deploy**: Vercel (produção) / Docker (local)

## 🏁 Começando

### Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose (para desenvolvimento local)
- npm ou yarn

### Instalação Local

1. **Clone o repositório**
```bash
git clone <seu-repo>
cd omcprod-v2
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local` se necessário (valores padrão já estão configurados).

4. **Inicie o banco de dados PostgreSQL com Docker**
```bash
npm run docker:up
```

Aguarde alguns segundos para o PostgreSQL inicializar.

5. **Execute as migrations do Prisma**
```bash
npx prisma migrate dev --name init
```

6. **Popule o banco com dados iniciais (seed)**
```bash
npm run prisma:seed
```

7. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

8. **Acesse o sistema**
```
http://localhost:3000
```

## 📊 Prisma Studio

Para visualizar e editar dados diretamente no banco:

```bash
npm run prisma:studio
```

Acesse: `http://localhost:5555`

## 🐳 Comandos Docker

```bash
# Iniciar o banco de dados
npm run docker:up

# Parar o banco de dados
npm run docker:down

# Resetar banco (apaga todos os dados!)
npm run docker:reset
```

## 📁 Estrutura do Projeto

```
omcprod-v2/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── products/      # CRUD de produtos
│   │   ├── purchases/     # CRUD de compras
│   │   ├── sales/         # Gerenciamento de vendas
│   │   └── stock/         # Controle de estoque
│   ├── compras/           # Página de compras
│   ├── vendas/            # Página de vendas
│   ├── estoque/           # Página de estoque
│   ├── pontos/            # Página de pontos/milhas
│   ├── layout.tsx         # Layout global
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   └── ui/               # Componentes shadcn/ui
├── lib/                   # Utilidades
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funções auxiliares
├── prisma/               # Prisma ORM
│   ├── schema.prisma     # Schema do banco
│   └── seed.ts           # Dados iniciais
├── public/               # Arquivos estáticos
├── docker-compose.yml    # Configuração Docker
├── .env.local            # Variáveis de ambiente
├── package.json          # Dependências
└── README.md            # Este arquivo
```

## 🗄️ Modelos do Banco de Dados

### Product
Produtos disponíveis (modelos de iPhone)
- name, model, storage, color

### Purchase
Registro de compras com todos os detalhes financeiros
- Datas, valores, pontos, cashback, conta utilizada
- Cálculo automático de custo final
- Status: PENDING, DELIVERED, SOLD, CANCELLED

### Stock
Controle de estoque por produto
- Quantidade a caminho
- Quantidade em estoque
- Custo médio unitário
- Valor total em estoque

### PointsProgram
Programas de pontos/milhas (Esfera, Livelo, Smiles, etc.)

### PointsAccount
Contas por programa e titular
- Saldo atual
- Pontos a receber

### MonthlyReport
Relatórios mensais gerados automaticamente
- Investimento, faturamento, lucro, deságio

## 🚀 Deploy na Vercel

### 1. Crie um banco de dados PostgreSQL na Vercel

```bash
vercel postgres create
```

### 2. Configure as variáveis de ambiente

No painel da Vercel, adicione:
- `DATABASE_URL` (URL do Vercel Postgres)

### 3. Deploy

```bash
vercel --prod
```

### 4. Execute as migrations

```bash
npx prisma migrate deploy
```

### 5. Popule o banco (opcional)

```bash
npx prisma db seed
```

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa o linter |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Cria nova migration |
| `npm run prisma:studio` | Abre Prisma Studio |
| `npm run prisma:seed` | Popula banco com dados iniciais |
| `npm run docker:up` | Inicia PostgreSQL no Docker |
| `npm run docker:down` | Para PostgreSQL |
| `npm run docker:reset` | Reseta banco completamente |

## 🔧 Desenvolvimento

### Adicionar nova migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Resetar banco de dados

```bash
npx prisma migrate reset
```

### Gerar Prisma Client após mudanças no schema

```bash
npx prisma generate
```

## 📊 Dados de Exemplo

Após rodar o seed, o banco terá:
- ✅ 10 modelos de iPhone (13, 14, 15 - 128/256GB - Branco/Preto)
- ✅ 6 programas de pontos (Esfera, Livelo, Smiles, Azul, AA, LATAM)
- ✅ 5 contas por programa (Miri, Vini, Lindy, Milla, Tony)
- ✅ Estoque zerado para todos os produtos

## 🐛 Troubleshooting

### Erro de conexão com banco de dados

```bash
# Verifique se o Docker está rodando
docker ps

# Reinicie o container
npm run docker:reset
```

### Erro no Prisma Client

```bash
# Regenere o client
npx prisma generate
```

### Porta 3000 já em uso

```bash
# Use outra porta
PORT=3001 npm run dev
```

### Porta 5432 já em uso

Você já tem PostgreSQL rodando localmente. Edite `docker-compose.yml` para usar outra porta:

```yaml
ports:
  - "5433:5432"  # Muda de 5432 para 5433
```

E atualize `.env.local`:
```
DATABASE_URL="postgresql://omcprod:omcprod123@localhost:5433/omcprod?schema=public"
```

## 📚 Próximos Passos

### Fase 1 - MVP (Em Desenvolvimento)
- [x] Setup inicial do projeto
- [x] Configuração Docker + Prisma
- [x] Models do banco de dados
- [x] API Routes básicas
- [ ] Página de Compras (formulário + listagem)
- [ ] Página de Vendas
- [ ] Dashboard inicial

### Fase 2 - Funcionalidades Core
- [ ] Gestão de Estoque completa
- [ ] Sistema de Pontos/Milhas
- [ ] Filtros avançados
- [ ] Exportação de dados

### Fase 3 - Relatórios e Analytics
- [ ] Dashboard com gráficos
- [ ] Relatórios mensais automáticos
- [ ] Análise de performance
- [ ] Previsões

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Autor

Desenvolvido para gestão de revenda de produtos eletrônicos.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Versão**: 2.0.0  
**Última atualização**: Fevereiro 2026
