import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export async function GET() {
  try {
    const logs = await prisma.actionLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
