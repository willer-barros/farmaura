// src/app/api/users/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, role } = await req.json()

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { name, email, role: role ?? 'STUDENT' },
  })

  return NextResponse.json(user, { status: 201 })
}