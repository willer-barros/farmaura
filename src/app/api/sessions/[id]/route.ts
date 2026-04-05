import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await prisma.session.findUnique({
    where: { id },
  })

  if (!session) {
    return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })
  }

  return NextResponse.json(session)
}