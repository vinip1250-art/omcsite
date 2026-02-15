# 🚀 Início Rápido - OMC Prod v2.0

## ⚡ Setup em 3 Passos

### 1️⃣ Clone e Instale
```bash
cd omcprod-v2
npm install
```

### 2️⃣ Configure o Banco
```bash
# Inicie o PostgreSQL
npm run docker:up

# Aguarde 10 segundos, depois execute:
npx prisma migrate dev --name init
npm run prisma:seed
```

### 3️⃣ Rode o Projeto
```bash
npm run dev
```

Pronto! Acesse: **http://localhost:3000** 🎉

---

## 🛠️ Setup Automático (Alternativa)

Se preferir, use o script automático:

```bash
chmod +x setup.sh
./setup.sh
```

---

## 📊 Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia servidor (http://localhost:3000) |
| `npm run prisma:studio` | Abre editor visual do banco |
| `npm run docker:up` | Liga o PostgreSQL |
| `npm run docker:down` | Desliga o PostgreSQL |
| `npm run docker:reset` | Reseta banco (⚠️ apaga dados) |

---

## 🗄️ Estrutura do Banco

Após o seed, você terá:

- ✅ **10 modelos de iPhone** (13, 14, 15)
- ✅ **6 programas de pontos** (Esfera, Livelo, Smiles, Azul, AA, LATAM)
- ✅ **5 contas** por programa (Miri, Vini, Lindy, Milla, Tony)
- ✅ **Estoque** zerado e pronto para uso

---

## 🌐 Deploy na Vercel

### Setup Rápido

1. Crie banco Vercel Postgres:
```bash
vercel postgres create
```

2. Adicione a `DATABASE_URL` nas variáveis de ambiente da Vercel

3. Deploy:
```bash
vercel --prod
```

4. Execute migrations:
```bash
npx prisma migrate deploy
```

---

## 🐛 Problemas Comuns

### PostgreSQL já rodando na porta 5432?

Edite `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use porta 5433
```

E `.env.local`:
```
DATABASE_URL="postgresql://omcprod:omcprod123@localhost:5433/omcprod?schema=public"
```

### Erro de conexão?

```bash
# Reinicie o Docker
npm run docker:reset
```

### Prisma Client desatualizado?

```bash
npx prisma generate
```

---

## 📁 Estrutura de Arquivos

```
omcprod-v2/
├── app/                 # Páginas e API Routes
│   ├── api/            # Endpoints REST
│   ├── compras/        # Página de compras
│   ├── vendas/         # Página de vendas
│   ├── estoque/        # Página de estoque
│   └── pontos/         # Página de pontos/milhas
├── components/         # Componentes React
├── lib/               # Utilitários
├── prisma/            # Schema e migrations
├── docker-compose.yml # Config Docker
└── .env.local        # Variáveis de ambiente
```

---

## 🎯 Próximos Passos

Agora você pode:

1. **Testar a API** → http://localhost:3000/api/products
2. **Ver o banco** → `npm run prisma:studio`
3. **Criar primeira compra** → Em breve!
4. **Importar sua planilha** → Desenvolveremos um script

---

## 💡 Dicas

- Use `Prisma Studio` para visualizar e editar dados
- Faça backup antes de `docker:reset`
- Em produção, use variáveis de ambiente da Vercel
- Mantenha `.env.local` no `.gitignore`

---

**Versão**: 2.0.0  
**Criado**: Fevereiro 2026  
**Stack**: Next.js 15 + Prisma + PostgreSQL
