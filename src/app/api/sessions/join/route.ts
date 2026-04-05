import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { sessionId, userId } = await req.json()

  const participant = await prisma.sessionParticipant.upsert({
    where: { sessionId_userId: { sessionId, userId } },
    create: { sessionId, userId, aura: 0 },
    update: {},
  })

  return NextResponse.json(participant, { status: 201 })
}