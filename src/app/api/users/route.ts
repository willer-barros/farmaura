// src/app/api/users/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try{
    const { name, email, role } = await req.json()
  
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { name, email, role: role ?? 'STUDENT' },
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch(error){
    console.error('Erro em /api/users', error)
    return NextResponse.json({error: String(error)}, {status:500})
  }

}