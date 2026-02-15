# 💻 Guia de Desenvolvimento - OMC Prod v2.0

## 🎯 Para Desenvolvedores

Este guia contém dicas e padrões para continuar desenvolvendo o sistema.

---

## 📐 Padrões de Código

### Estrutura de Pastas

```
app/
├── (pages)/           # Páginas públicas
│   ├── compras/
│   ├── vendas/
│   ├── estoque/
│   └── pontos/
├── api/              # API Routes
│   ├── products/
│   ├── purchases/
│   ├── sales/
│   └── stock/
└── components/       # Componentes específicos da página

components/
└── ui/              # Componentes reutilizáveis (shadcn/ui)

lib/
├── prisma.ts        # Cliente Prisma
├── utils.ts         # Funções auxiliares
└── validations.ts   # Schemas Zod (criar)
```

### Nomenclatura

```typescript
// Arquivos
- route.ts (API Routes)
- page.tsx (Páginas)
- layout.tsx (Layouts)
- loading.tsx (Loading states)
- error.tsx (Error boundaries)

// Componentes
- PascalCase: ProductForm, PurchaseTable
- Arquivos: product-form.tsx, purchase-table.tsx

// Funções
- camelCase: calculateProfit, formatCurrency
- Async: getPurchases, createPurchase
```

---

## 🧩 Criando uma Nova Página

### 1. Criar estrutura
```bash
mkdir -p app/compras
touch app/compras/page.tsx
```

### 2. Criar componente
```typescript
// app/compras/page.tsx
export default function ComprasPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Compras</h1>
      {/* Conteúdo */}
    </div>
  )
}
```

### 3. Adicionar metadata
```typescript
export const metadata = {
  title: 'Compras | OMC Prod',
  description: 'Gerencie suas compras',
}
```

---

## 🔌 Criando uma Nova API Route

### 1. Criar arquivo
```bash
mkdir -p app/api/sales
touch app/api/sales/route.ts
```

### 2. Implementar handlers
```typescript
// app/api/sales/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sales = await prisma.purchase.findMany({
      where: { status: 'SOLD' },
      include: { product: true },
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Validar com Zod
    // Processar
    // Retornar
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}
```

### 3. Adicionar validação Zod
```typescript
import { z } from 'zod'

const saleSchema = z.object({
  purchaseId: z.string(),
  soldValue: z.number().positive(),
  saleDate: z.string().datetime(),
  customer: z.string().min(1),
})

// Usar
const validatedData = saleSchema.parse(body)
```

---

## 🗄️ Trabalhando com Prisma

### Queries Comuns

```typescript
// Buscar todos
const products = await prisma.product.findMany()

// Buscar com filtro
const purchases = await prisma.purchase.findMany({
  where: { account: 'Miri' },
  include: { product: true },
})

// Buscar um
const product = await prisma.product.findUnique({
  where: { id: 'clx...' },
})

// Criar
const purchase = await prisma.purchase.create({
  data: { /* ... */ },
  include: { product: true },
})

// Atualizar
await prisma.purchase.update({
  where: { id: 'clx...' },
  data: { status: 'SOLD' },
})

// Deletar
await prisma.purchase.delete({
  where: { id: 'clx...' },
})

// Agregar
const stats = await prisma.purchase.aggregate({
  _sum: { paidValue: true },
  _avg: { profit: true },
  where: { month: 'JAN25' },
})
```

### Transações
```typescript
await prisma.$transaction(async (tx) => {
  // Atualizar compra
  await tx.purchase.update({
    where: { id: purchaseId },
    data: { status: 'SOLD', soldValue, saleDate, customer, profit },
  })
  
  // Atualizar estoque
  await tx.stock.update({
    where: { productId },
    data: { inStock: { decrement: 1 } },
  })
})
```

---

## 🎨 Componentes shadcn/ui

### Instalação de Componentes

```bash
# Você precisará clonar manualmente ou usar npx
# Exemplos:

# Input
npx shadcn-ui@latest add input

# Select
npx shadcn-ui@latest add select

# Table
npx shadcn-ui@latest add table

# Dialog
npx shadcn-ui@latest add dialog

# Form
npx shadcn-ui@latest add form
```

### Componentes Necessários

Para o projeto completo, instale:
```bash
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
```

---

## 📋 Exemplo: Página de Compras Completa

```typescript
// app/compras/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Purchase {
  id: string
  product: {
    name: string
  }
  paidValue: number
  finalCost: number
  status: string
}

export default function ComprasPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/purchases')
      .then(res => res.json())
      .then(data => {
        setPurchases(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Carregando...</div>

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compras</h1>
        <Button>Nova Compra</Button>
      </div>

      <div className="grid gap-4">
        {purchases.map(purchase => (
          <Card key={purchase.id}>
            <CardHeader>
              <CardTitle>{purchase.product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Valor: R$ {purchase.paidValue.toFixed(2)}</p>
              <p>Custo Final: R$ {purchase.finalCost.toFixed(2)}</p>
              <p>Status: {purchase.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔧 Utilitários Úteis

### Criar em lib/validations.ts
```typescript
import { z } from 'zod'

export const purchaseSchema = z.object({
  productId: z.string().cuid(),
  purchaseDate: z.string().datetime(),
  deliveryDate: z.string().datetime().optional(),
  paidValue: z.number().positive(),
  account: z.enum(['Miri', 'Vini', 'Lindy', 'Milla', 'Tony']),
  points: z.number().nonnegative(),
  thousand: z.number().nonnegative(),
  cashback: z.number().nonnegative(),
})

export const saleSchema = z.object({
  purchaseId: z.string().cuid(),
  soldValue: z.number().positive(),
  saleDate: z.string().datetime(),
  customer: z.string().min(1),
})
```

### Criar em lib/constants.ts
```typescript
export const ACCOUNTS = ['Miri', 'Vini', 'Lindy', 'Milla', 'Tony'] as const
export const PURCHASE_STATUS = ['PENDING', 'DELIVERED', 'SOLD', 'CANCELLED'] as const
export const PROGRAMS = ['Esfera', 'Livelo', 'Smiles', 'Azul', 'AA', 'LATAM'] as const
```

---

## 🧪 Testes (Futuro)

### Estrutura sugerida
```
__tests__/
├── api/
│   ├── products.test.ts
│   └── purchases.test.ts
├── components/
│   └── button.test.tsx
└── lib/
    └── utils.test.ts
```

### Exemplo de teste
```typescript
// __tests__/lib/utils.test.ts
import { calculateFinalCost } from '@/lib/utils'

describe('calculateFinalCost', () => {
  it('should calculate correctly', () => {
    const result = calculateFinalCost({
      paidValue: 3500,
      advanceDiscount: 125.5,
      cashback: 700,
      points: 50000,
      thousand: 14,
    })
    expect(result).toBe(1974.5)
  })
})
```

---

## 📊 Performance

### Dicas de Otimização

1. **Use Server Components quando possível**
```typescript
// Busca dados no servidor (mais rápido)
async function getData() {
  const res = await fetch('...')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{/* ... */}</div>
}
```

2. **Adicione índices no Prisma**
```prisma
model Purchase {
  // ...
  @@index([purchaseDate])
  @@index([status])
  @@index([account])
}
```

3. **Use paginação**
```typescript
const purchases = await prisma.purchase.findMany({
  take: 10,
  skip: page * 10,
})
```

---

## 🔍 Debug

### Prisma Query Logging
```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

### Next.js Debug
```bash
NODE_OPTIONS='--inspect' npm run dev
```

### Ver SQL gerado
```bash
npx prisma studio
# Ou olhe os logs no console
```

---

## 📚 Recursos

### Documentação Oficial
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)

### Tutoriais Úteis
- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)

---

## ✅ Checklist para Nova Feature

Antes de considerar uma feature completa:

- [ ] Modelo no Prisma (se necessário)
- [ ] Migration criada
- [ ] API Route implementada
- [ ] Validação Zod
- [ ] Página ou componente UI
- [ ] Error handling
- [ ] Loading states
- [ ] Testado manualmente
- [ ] Documentação atualizada

---

## 🚀 Próximos Passos Sugeridos

### 1. Implementar Formulário de Compras
- React Hook Form + Zod
- Select de produtos
- Campos de data com calendar
- Cálculo automático do custo final em tempo real

### 2. Tabela de Compras com Filtros
- TanStack Table
- Filtros por status, conta, data
- Ordenação por colunas
- Paginação

### 3. Modal de Venda
- Marcar compra como vendida
- Input de valor de venda
- Cálculo automático de lucro
- Seleção de cliente

### 4. Dashboard
- Cards com KPIs
- Gráficos Recharts
- Resumo mensal
- Últimas vendas

---

**Última atualização**: Fevereiro 2026  
**Versão**: 2.0.0
