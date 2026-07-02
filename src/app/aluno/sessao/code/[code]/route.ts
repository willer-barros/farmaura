import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const session = await prisma.session.findUnique({
    where: { code: params.code },
  })

  if (!session) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  }

  if (session.status === 'ENDED') {
    return NextResponse.json({ error: 'Esta aula já foi encerrada' }, { status: 410 })
  }

  return NextResponse.json(session)
}