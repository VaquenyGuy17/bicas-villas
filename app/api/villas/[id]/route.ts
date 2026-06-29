import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json()
    const { id } = await params
    
    // We update the villa, and for simplicity, delete all existing tags/tarefas and recreate them.
    await prisma.tag.deleteMany({ where: { villaId: id } })
    await prisma.tarefa.deleteMany({ where: { villaId: id } })
    
    const villa = await prisma.villa.update({
      where: { id },
      data: {
        numero: data.numero,
        nota: data.nota,
        tags: {
          create: data.tags?.map((t: any) => ({ nome: t.nome, classe: t.classe })) || []
        },
        tarefas: {
          create: data.tarefas?.map((t: any) => ({ icon: t.icon, desc: t.desc })) || []
        }
      },
      include: { tags: true, tarefas: true }
    })

    if (data.workerName && data.workerId) {
      await prisma.actionLog.create({
        data: {
          action: "UPDATE",
          villaNumero: villa.numero,
          workerName: data.workerName,
          workerId: data.workerId
        }
      })
    }

    return NextResponse.json(villa)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update villa' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = new URL(req.url);
    const workerName = url.searchParams.get("workerName");
    const workerId = url.searchParams.get("workerId");
    
    const villa = await prisma.villa.findUnique({ where: { id } })
    await prisma.villa.delete({ where: { id } })
    
    if (villa && workerName && workerId) {
      await prisma.actionLog.create({
        data: {
          action: "DELETE",
          villaNumero: villa.numero,
          workerName,
          workerId
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete villa' }, { status: 500 })
  }
}
