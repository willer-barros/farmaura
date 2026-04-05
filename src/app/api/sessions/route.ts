// src/app/api/sessions/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  const { name, hostId } = await req.json()

  const session = await prisma.session.create({
    data: {
      name,
      hostId,
      code: nanoid(6).toUpperCase(), // ex: "K3X9PQ"
      status: 'WAITING',
    },
  })

  return NextResponse.json(session, { status: 201 })
}

// PATCH /api/sessions/[id] — muda status (ACTIVE → ENDED)
export async function PATCH(req: Request) {
  const { id, status } = await req.json()

  const session = await prisma.session.update({
    where: { id },
    data: {
      status,
      endedAt: status === 'ENDED' ? new Date() : undefined,
    },
  })

  return NextResponse.json(session)
}