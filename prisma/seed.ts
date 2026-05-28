import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pharmaqo.com' },
    update: {},
    create: {
      name: 'Admin PharmaQo',
      email: 'admin@pharmaqo.com',
      password: adminPassword,
      phone: '(11) 99999-0000',
      role: 'admin',
    },
  })

  // Create customer user
  const customerPassword = await bcrypt.hash('cliente123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@email.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'cliente@email.com',
      password: customerPassword,
      phone: '(11) 98888-1234',
      role: 'customer',
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'anabolizantes' }, update: {}, create: { name: 'Anabolizantes', slug: 'anabolizantes' } }),
    prisma.category.upsert({ where: { slug: 'peptideos' }, update: {}, create: { name: 'Peptídeos', slug: 'peptideos' } }),
    prisma.category.upsert({ where: { slug: 'sarms' }, update: {}, create: { name: 'SARMs', slug: 'sarms' } }),
    prisma.category.upsert({ where: { slug: 'suplementos' }, update: {}, create: { name: 'Suplementos', slug: 'suplementos' } }),
    prisma.category.upsert({ where: { slug: 'combos' }, update: {}, create: { name: 'Combos', slug: 'combos' } }),
    prisma.category.upsert({ where: { slug: 'acessorios' }, update: {}, create: { name: 'Acessórios', slug: 'acessorios' } }),
  ])

  // Create products
  const productsData = [
    {
      name: 'Testosterone Enanthate 250mg',
      slug: 'testosterone-enanthate-250mg',
      description: 'Testosterona Enantato de alta pureza, 250mg/ml. Formulação premium com pureza de 99.2%. Ideal para protocolos de TRT e ciclos de ganho de massa muscular.',
      price: 189.90,
      comparePrice: 249.90,
      stock: 150,
      categoryId: categories[0].id,
      composition: 'Testosterona Enantato 250mg/ml, Óleo de Semente de Uva, Álcool Benzílico 2%, Benzoato de Benzila 20%',
      benefits: 'Aumento de massa muscular, melhora da força, recuperação acelerada, aumento da libido',
      dosage: '250-500mg/semana',
      tags: 'MAIS VENDIDO,NOVO',
      featured: true,
      uid: 'PQ-TEST-E250-0001',
      lot: 'LOT-2024-001',
      expiry: '12/2026',
    },
    {
      name: 'Trembolone Acetate 100mg',
      slug: 'trembolone-acetate-100mg',
      description: 'Trembolona Acetato de grau farmacêutico, 100mg/ml. Um dos compostos mais potentes disponíveis para ganhos extremos de força e definição.',
      price: 259.90,
      comparePrice: 329.90,
      stock: 80,
      categoryId: categories[0].id,
      composition: 'Trembolona Acetato 100mg/ml, MCT Oil, Álcool Benzílico 2%',
      benefits: 'Ganhos extremos de força, definição muscular, queima de gordura, sem retenção hídrica',
      dosage: '200-400mg/semana',
      tags: 'LANÇAMENTO',
      featured: true,
      uid: 'PQ-TREN-A100-0001',
      lot: 'LOT-2024-002',
      expiry: '06/2026',
    },
    {
      name: 'BPC-157 5mg',
      slug: 'bpc-157-5mg',
      description: 'Peptídeo BPC-157 liofilizado de alta pureza para recuperação tecidual avançada. Testado em laboratório com pureza superior a 98%.',
      price: 149.90,
      stock: 200,
      categoryId: categories[1].id,
      composition: 'BPC-157 5mg liofilizado, Manitol',
      benefits: 'Recuperação de tendões e ligamentos, cicatrização acelerada, proteção gastrointestinal',
      dosage: '250-500mcg/dia',
      tags: 'NOVO',
      featured: true,
      uid: 'PQ-BPC-157-0001',
      lot: 'LOT-2024-003',
      expiry: '03/2027',
    },
    {
      name: 'Ostarine MK-2866 25mg',
      slug: 'ostarine-mk-2866-25mg',
      description: 'SARM Ostarine MK-2866 em cápsulas de 25mg. O SARM mais estudado e seguro para ganhos moderados de massa magra com mínimos efeitos colaterais.',
      price: 199.90,
      comparePrice: 259.90,
      stock: 120,
      categoryId: categories[2].id,
      composition: 'Ostarine MK-2866 25mg, Celulose Microcristalina, Estearato de Magnésio',
      benefits: 'Ganhos de massa magra, preservação muscular em cutting, melhora da densidade óssea',
      dosage: '25mg/dia por 8-12 semanas',
      tags: 'MAIS VENDIDO',
      featured: true,
      uid: 'PQ-OSTA-MK28-0001',
      lot: 'LOT-2024-004',
      expiry: '09/2026',
    },
    {
      name: 'Combo Bulking Premium',
      slug: 'combo-bulking-premium',
      description: 'Kit completo para ciclo de bulking com Testosterona Enantato + Deca Durabolin + PCT completo. Tudo que você precisa para um ciclo seguro.',
      price: 599.90,
      comparePrice: 799.90,
      stock: 30,
      categoryId: categories[4].id,
      composition: 'Test E 250mg x2, Deca 200mg x2, Tamoxifeno 20mg x30, Clomifeno 50mg x30',
      benefits: 'Ciclo completo com PCT, ganhos máximos de massa, recuperação hormonal incluída',
      dosage: 'Consulte protocolo incluso',
      tags: 'COMBO,OFERTA',
      featured: true,
      uid: 'PQ-COMBO-BULK-0001',
      lot: 'LOT-2024-005',
      expiry: '12/2026',
    },
    {
      name: 'Deca Durabolin 200mg',
      slug: 'deca-durabolin-200mg',
      description: 'Nandrolona Decanoato 200mg/ml. Composto clássico para ganho de massa com excelente retenção nitrogenada e proteção articular.',
      price: 179.90,
      stock: 100,
      categoryId: categories[0].id,
      composition: 'Nandrolona Decanoato 200mg/ml, Óleo de Gergelim, Álcool Benzílico 2%',
      benefits: 'Ganho de massa muscular, proteção articular, aumento da síntese de colágeno',
      dosage: '200-400mg/semana',
      tags: 'MAIS VENDIDO',
      featured: false,
      uid: 'PQ-DECA-D200-0001',
      lot: 'LOT-2024-006',
      expiry: '08/2026',
    },
    {
      name: 'Cardarine GW-501516 20mg',
      slug: 'cardarine-gw-501516-20mg',
      description: 'Cardarine GW-501516 em cápsulas de 20mg. Potente agonista PPAR-delta para aumento dramático da resistência e queima de gordura.',
      price: 189.90,
      stock: 90,
      categoryId: categories[2].id,
      composition: 'GW-501516 20mg, Celulose Microcristalina',
      benefits: 'Aumento da resistência aeróbica, queima de gordura, melhora do perfil lipídico',
      dosage: '10-20mg/dia por 8-12 semanas',
      tags: 'LANÇAMENTO',
      featured: false,
      uid: 'PQ-CARD-GW50-0001',
      lot: 'LOT-2024-007',
      expiry: '11/2026',
    },
    {
      name: 'Whey Protein Isolate Premium',
      slug: 'whey-protein-isolate-premium',
      description: 'Whey Protein Isolado de alta qualidade com 90% de proteína por dose. Sabor chocolate premium com dissolução instantânea.',
      price: 149.90,
      comparePrice: 189.90,
      stock: 250,
      categoryId: categories[3].id,
      composition: 'Whey Protein Isolado (WPI 90%), Cacau em pó, Sucralose, Lecitina de Soja',
      benefits: 'Recuperação muscular, ganho de massa magra, alta absorção',
      dosage: '30g (1 scoop) pós-treino',
      tags: 'OFERTA',
      featured: false,
      uid: 'PQ-WHEY-ISO-0001',
      lot: 'LOT-2024-008',
      expiry: '01/2027',
    },
    {
      name: 'Combo Cutting Extreme',
      slug: 'combo-cutting-extreme',
      description: 'Kit completo para definição extrema: Trembolona + Winstrol + Clenbuterol + PCT. Para atletas avançados que buscam definição máxima.',
      price: 749.90,
      comparePrice: 999.90,
      stock: 20,
      categoryId: categories[4].id,
      composition: 'Tren A 100mg x2, Stanozolol 50mg x2, Clenbuterol 40mcg x100, PCT completo',
      benefits: 'Definição extrema, queima de gordura, preservação muscular, vascularização',
      dosage: 'Consulte protocolo incluso',
      tags: 'COMBO,LIMITADO',
      featured: true,
      uid: 'PQ-COMBO-CUT-0001',
      lot: 'LOT-2024-009',
      expiry: '10/2026',
    },
    {
      name: 'Seringa Descartável 3ml',
      slug: 'seringa-descartavel-3ml',
      description: 'Seringa descartável premium com agulha 25G para aplicação intramuscular. Embalagem individual estéril.',
      price: 4.90,
      stock: 1000,
      categoryId: categories[5].id,
      composition: 'Seringa 3ml com agulha 25G x 25mm',
      benefits: 'Aplicação precisa, agulha fina, descartável estéril',
      dosage: 'Uso único',
      tags: '',
      featured: false,
      uid: 'PQ-SERI-3ML-0001',
      lot: 'LOT-2024-010',
      expiry: '12/2028',
    },
  ]

  for (const productData of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } })
    if (!existing) {
      await prisma.product.create({ data: productData })
    }
  }

  // Create freight table
  const freightData = [
    { state: 'SP', price: 50, days: 3 },
    { state: 'RJ', price: 50, days: 4 },
    { state: 'ES', price: 50, days: 5 },
    { state: 'MG', price: 50, days: 5 },
    { state: 'DF', price: 50, days: 5 },
    { state: 'SC', price: 50, days: 5 },
    { state: 'PR', price: 50, days: 5 },
    { state: 'RS', price: 50, days: 5 },
    { state: 'SE', price: 60, days: 7 },
    { state: 'AL', price: 60, days: 7 },
    { state: 'BA', price: 60, days: 7 },
    { state: 'PB', price: 60, days: 7 },
    { state: 'CE', price: 60, days: 7 },
    { state: 'PI', price: 60, days: 8 },
    { state: 'PA', price: 60, days: 8 },
    { state: 'GO', price: 60, days: 6 },
    { state: 'TO', price: 60, days: 8 },
    { state: 'MS', price: 60, days: 6 },
    { state: 'RN', price: 70, days: 8 },
    { state: 'MA', price: 70, days: 9 },
    { state: 'MT', price: 70, days: 7 },
    { state: 'PE', price: 80, days: 8 },
    { state: 'AM', price: 80, days: 10 },
    { state: 'AP', price: 90, days: 12 },
    { state: 'AC', price: 90, days: 12 },
    { state: 'RO', price: 80, days: 10 },
    { state: 'RR', price: 90, days: 12 },
  ]

  for (const f of freightData) {
    await prisma.freight.upsert({
      where: { state: f.state },
      update: { price: f.price, days: f.days },
      create: f,
    })
  }

  // Create coupon
  await prisma.coupon.upsert({
    where: { code: 'PHARMA10' },
    update: {},
    create: { code: 'PHARMA10', discount: 10, type: 'percentage', maxUses: 100 },
  })
  await prisma.coupon.upsert({
    where: { code: 'PRIMEIRA20' },
    update: {},
    create: { code: 'PRIMEIRA20', discount: 20, type: 'percentage', maxUses: 50 },
  })

  console.log('Database seeded successfully!')
  console.log('Admin: admin@pharmaqo.com / admin123')
  console.log('Customer: cliente@email.com / cliente123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
