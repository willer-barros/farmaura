// src/app/api/aura/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { sessionId, userId, amount, reason } = await req.json()

  // Usa transação para garantir consistência
  const [event] = await prisma.$transaction([
    // 1. Registra o evento de aura (auditável)
    prisma.auraEvent.create({
      data: { sessionId, userId, amount, reason },
    }),
    // 2. Atualiza o placar do participante
    prisma.sessionParticipant.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      create: { sessionId, userId, aura: amount },
      update: { aura: { increment: amount } },
    }),
  ])

  return NextResponse.json(event, { status: 201 })
}