const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({})

async function main() {
  const villas = [
    {
      numero: "102",
      nota: "As tarefas desta villa estão incluídas nas tarefas comuns a todas as villas.",
      tags: {
        create: [
          { nome: "🌿 Jardim", classe: "tag-jardim" },
          { nome: "🧹 Limpeza", classe: "tag-limpeza" }
        ]
      },
      tarefas: {
        create: [
          { icon: "🌿", desc: "Retirar plantas que crescem nos caminhos entre tábuas e nas pedras à volta da villa" },
          { icon: "🪵", desc: "Canteiros da frente têm casca de pinheiro — deixar a casca no canteiro" },
          { icon: "🪴", desc: "Limpar a zona do deck na parte de trás e o caminho para a piscina" }
        ]
      }
    },
    {
      numero: "103",
      nota: "A fertirega requer formação específica. Não realizar sem ter sido ensinado pela coordenadora.",
      tags: {
        create: [
          { nome: "🌿 Jardim", classe: "tag-jardim" },
          { nome: "💧 Lago", classe: "tag-piscina" },
          { nome: "🔧 Manutenção", classe: "tag-manutencao" }
        ]
      },
      tarefas: {
        create: [
          { icon: "✂️", desc: "Cortar a relva" },
          { icon: "🪣", desc: "Limpar o skimmer do lago (retirar folhas e detritos do cesto)" },
          { icon: "💧", desc: "Fazer fertirega — aguardar formação da coordenadora" },
          { icon: "🌊", desc: "Verificar que a cascata de água está a cair normalmente — se não tiver água a cair, avisar coordenadora" },
          { icon: "🧹", desc: "Limpar a frente da casa e o canteiro ao lado do lago" },
          { icon: "🍋", desc: "Verificar as árvores de fruta que ficam depois do lago — reportar qualquer anomalia" }
        ]
      }
    },
    {
      numero: "104",
      nota: null,
      tags: {
        create: [
          { nome: "🌿 Jardim", classe: "tag-jardim" },
          { nome: "🧹 Limpeza", classe: "tag-limpeza" }
        ]
      },
      tarefas: {
        create: [
          { icon: "🌿", desc: "Tirar ervas que crescem no deck entre as tábuas e nas pedras à volta da casa" },
          { icon: "🧹", desc: "Limpeza geral do jardim — varrer folhas, limpar caminhos e áreas exteriores" }
        ]
      }
    }
  ]

  for (const v of villas) {
    const existing = await prisma.villa.findUnique({ where: { numero: v.numero } })
    if (!existing) {
      await prisma.villa.create({ data: v })
    }
  }
}

main()
  .then(() => console.log('Database seeded successfully!'))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
