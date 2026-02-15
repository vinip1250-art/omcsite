# 🧪 Testes da API - OMC Prod v2.0

Este arquivo contém exemplos de requisições para testar a API do sistema.

## 🔧 Ferramentas Recomendadas

- **curl** (linha de comando)
- **Postman** (interface gráfica)
- **Insomnia** (interface gráfica)
- **VS Code REST Client** (extensão)

---

## 📦 Produtos

### Listar todos os produtos
```bash
curl http://localhost:3000/api/products
```

**Resposta esperada:**
```json
[
  {
    "id": "clx...",
    "name": "13 128 Branco",
    "model": "13",
    "storage": "128",
    "color": "Branco",
    "active": true,
    "createdAt": "2025-02-14T...",
    "updatedAt": "2025-02-14T..."
  }
]
```

### Criar novo produto
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "16 256 Azul",
    "model": "16",
    "storage": "256",
    "color": "Azul"
  }'
```

---

## 🛒 Compras

### Listar todas as compras
```bash
curl http://localhost:3000/api/purchases
```

### Filtrar por status
```bash
# Pendentes (aguardando entrega)
curl "http://localhost:3000/api/purchases?status=PENDING"

# Entregues (em estoque)
curl "http://localhost:3000/api/purchases?status=DELIVERED"

# Vendidas
curl "http://localhost:3000/api/purchases?status=SOLD"
```

### Filtrar por conta
```bash
curl "http://localhost:3000/api/purchases?account=Miri"
```

### Criar nova compra (exemplo completo)
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "COLE_AQUI_O_ID_DO_PRODUTO",
    "purchaseDate": "2025-02-14",
    "deliveryDate": "2025-02-20",
    "orderNumber": "123456789",
    "paidValue": 3500,
    "account": "Miri",
    "shipping": 0,
    "advanceDiscount": 125.50,
    "pointsReceived": true,
    "points": 50000,
    "thousand": 14,
    "cashback": 700,
    "clubAndStore": "CB/Azul",
    "pointsPerReal": 14
  }'
```

**Resposta esperada:**
```json
{
  "id": "clx...",
  "productId": "clx...",
  "purchaseDate": "2025-02-14T00:00:00.000Z",
  "deliveryDate": "2025-02-20T00:00:00.000Z",
  "orderNumber": "123456789",
  "paidValue": 3500,
  "account": "Miri",
  "shipping": 0,
  "advanceDiscount": 125.5,
  "pointsReceived": true,
  "points": 50000,
  "thousand": 14,
  "cashback": 700,
  "clubAndStore": "CB/Azul",
  "pointsPerReal": 14,
  "finalCost": 2674.5,
  "soldValue": null,
  "saleDate": null,
  "month": null,
  "customer": null,
  "profit": null,
  "status": "DELIVERED",
  "createdAt": "2025-02-14T...",
  "updatedAt": "2025-02-14T...",
  "product": {
    "id": "clx...",
    "name": "13 128 Branco",
    "model": "13",
    "storage": "128",
    "color": "Branco"
  }
}
```

### Criar compra pendente (sem data de entrega)
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "COLE_AQUI_O_ID_DO_PRODUTO",
    "purchaseDate": "2025-02-14",
    "paidValue": 3500,
    "account": "Vini",
    "points": 50000,
    "thousand": 14,
    "cashback": 700
  }'
```

---

## 🧮 Cálculo Automático do Custo Final

O sistema calcula automaticamente o **custo final** da compra:

```
Custo Final = Valor Pago - Desconto Antecipado - Cashback - (Pontos * Milheiro / 1000)
```

### Exemplo:
```
Valor Pago: R$ 3.500,00
Desconto Antecipado: R$ 125,50
Cashback: R$ 700,00
Pontos: 50.000
Milheiro: 14

Cálculo dos Pontos: 50.000 * 14 / 1000 = R$ 700,00

Custo Final = 3.500 - 125,50 - 700 - 700 = R$ 1.974,50
```

---

## 📊 Testando via Browser (GET)

Você pode testar os endpoints GET diretamente no navegador:

```
http://localhost:3000/api/products
http://localhost:3000/api/purchases
http://localhost:3000/api/purchases?status=PENDING
http://localhost:3000/api/purchases?account=Miri
```

---

## 🧪 Fluxo de Teste Completo

### 1. Listar produtos disponíveis
```bash
curl http://localhost:3000/api/products | jq
```

### 2. Copiar o ID de um produto
```json
{
  "id": "clx123abc",  // ← Copie este ID
  "name": "13 128 Branco"
}
```

### 3. Criar uma compra com esse produto
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "clx123abc",
    "purchaseDate": "2025-02-14",
    "deliveryDate": "2025-02-20",
    "paidValue": 3500,
    "account": "Miri",
    "points": 50000,
    "thousand": 14,
    "cashback": 700
  }' | jq
```

### 4. Verificar a compra criada
```bash
curl http://localhost:3000/api/purchases | jq
```

### 5. Verificar estoque atualizado (quando deliveryDate presente)
```bash
# Via Prisma Studio
npm run prisma:studio
# Navegue até Stock e veja o produto
```

---

## 🔍 Usando jq para Formatar JSON

Se tiver `jq` instalado, adicione `| jq` no final dos comandos curl:

```bash
curl http://localhost:3000/api/products | jq
```

Instalar jq:
```bash
# Ubuntu/Debian
sudo apt install jq

# macOS
brew install jq
```

---

## 📝 Postman Collection (Exemplo)

Crie uma collection no Postman com estas requisições:

### Pasta: Products
- GET Products → `{{base_url}}/api/products`
- POST Product → `{{base_url}}/api/products`

### Pasta: Purchases
- GET Purchases → `{{base_url}}/api/purchases`
- GET Purchases (Pending) → `{{base_url}}/api/purchases?status=PENDING`
- GET Purchases (Miri) → `{{base_url}}/api/purchases?account=Miri`
- POST Purchase → `{{base_url}}/api/purchases`

**Variável de ambiente:**
```
base_url = http://localhost:3000
```

---

## ✅ Checklist de Testes

Antes de considerar a API funcional, teste:

- [ ] GET /api/products retorna array vazio ou com produtos
- [ ] POST /api/products cria um novo produto
- [ ] GET /api/products retorna o produto criado
- [ ] POST /api/purchases com todos os campos funciona
- [ ] POST /api/purchases sem deliveryDate cria status PENDING
- [ ] POST /api/purchases com deliveryDate cria status DELIVERED
- [ ] GET /api/purchases?status=PENDING filtra corretamente
- [ ] GET /api/purchases?account=Miri filtra corretamente
- [ ] Custo final é calculado automaticamente
- [ ] Estoque é atualizado quando deliveryDate é fornecido

---

## 🚨 Erros Comuns

### 500 Internal Server Error
```json
{ "error": "Failed to fetch products" }
```

**Solução**: Verifique se o PostgreSQL está rodando:
```bash
docker ps
npm run docker:up
```

### 400 Bad Request
```json
{ "error": "Missing required fields" }
```

**Solução**: Verifique se todos os campos obrigatórios estão presentes.

### CORS Error
Se testar de outro domínio, adicione CORS no `next.config.js`.

---

## 📞 Debug

### Ver logs do servidor
```bash
# Terminal onde rodou npm run dev
# Mostra todas as requisições
```

### Ver logs do PostgreSQL
```bash
docker-compose logs postgres
```

### Ver banco diretamente
```bash
npm run prisma:studio
```

---

**Última atualização**: Fevereiro 2026  
**Versão da API**: 2.0.0
