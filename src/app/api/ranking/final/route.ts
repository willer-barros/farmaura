import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')!

  const ranking = await prisma.sessionParticipant.findMany({
    where: { sessionId },
    orderBy: { aura: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  })

  return NextResponse.json(ranking)
}