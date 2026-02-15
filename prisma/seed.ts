import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar produtos (modelos de iPhone)
  const products = [
    { name: '13 128 Branco', model: '13', storage: '128', color: 'Branco' },
    { name: '13 128 Preto', model: '13', storage: '128', color: 'Preto' },
    { name: '14 128 Branco', model: '14', storage: '128', color: 'Branco' },
    { name: '14 128 Preto', model: '14', storage: '128', color: 'Preto' },
    { name: '14 256 Branco', model: '14', storage: '256', color: 'Branco' },
    { name: '14 256 Preto', model: '14', storage: '256', color: 'Preto' },
    { name: '15 128 Branco', model: '15', storage: '128', color: 'Branco' },
    { name: '15 128 Preto', model: '15', storage: '128', color: 'Preto' },
    { name: '15 256 Branco', model: '15', storage: '256', color: 'Branco' },
    { name: '15 256 Preto', model: '15', storage: '256', color: 'Preto' },
  ]

  console.log('📱 Criando produtos...')
  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    })
  }

  // Criar programas de pontos/milhas
  const programs = [
    { name: 'Esfera', type: 'points' },
    { name: 'Livelo', type: 'points' },
    { name: 'Smiles', type: 'miles' },
    { name: 'Azul', type: 'miles' },
    { name: 'AA', type: 'miles' },
    { name: 'LATAM', type: 'miles' },
  ]

  console.log('✈️ Criando programas de pontos/milhas...')
  for (const program of programs) {
    await prisma.pointsProgram.upsert({
      where: { name: program.name },
      update: {},
      create: program,
    })
  }

  // Criar contas para cada programa
  const accounts = ['Miri', 'Vini', 'Lindy', 'Milla', 'Tony']
  
  console.log('👥 Criando contas...')
  for (const program of programs) {
    const programData = await prisma.pointsProgram.findUnique({
      where: { name: program.name },
    })

    if (programData) {
      for (const accountName of accounts) {
        await prisma.pointsAccount.upsert({
          where: {
            programId_accountName: {
              programId: programData.id,
              accountName: accountName,
            },
          },
          update: {},
          create: {
            programId: programData.id,
            accountName: accountName,
            balance: 0,
            pointsToReceive: 0,
          },
        })
      }
    }
  }

  // Criar estoque zerado para cada produto
  console.log('📦 Criando estoque inicial...')
  const allProducts = await prisma.product.findMany()
  
  for (const product of allProducts) {
    await prisma.stock.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        onTheWay: 0,
        averageUnitCost: 0,
        inStock: 0,
        averageStockCost: 0,
        totalInStock: 0,
      },
    })
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
