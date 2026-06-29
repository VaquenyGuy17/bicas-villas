import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export async function GET() {
  try {
    const villas = await prisma.villa.findMany({
      include: {
        tags: true,
        tarefas: true,
      },
      orderBy: {
        numero: 'asc',
      }
    })
    return NextResponse.json(villas)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch villas' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const villa = await prisma.villa.create({
      data: {
        numero: data.numero,
        nota: data.nota,
        tags: {
          create: data.tags || []
        },
        tarefas: {
          create: data.tarefas || []
        }
      },
      include: { tags: true, tarefas: true }
    })
    
    if (data.workerName && data.workerId) {
      await prisma.actionLog.create({
        data: {
          action: "CREATE",
          villaNumero: data.numero,
          workerName: data.workerName,
          workerId: data.workerId
        }
      })
    }

    return NextResponse.json(villa)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create villa' }, { status: 500 })
  }
}
