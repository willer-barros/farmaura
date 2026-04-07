import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'



export async function POST(req: Request) {
  try {
    const { name, hostId } = await req.json()

    if (!hostId) {
      return NextResponse.json({ error: 'hostId é obrigatório' }, { status: 400 })
    }

    const session = await prisma.session.create({
      data: {
        name,
        code: nanoid(6).toUpperCase(),
        status: 'WAITING',
        host: {
          connect: { id: hostId }, // ← conecta ao usuário existente
        },
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Erro em /api/sessions:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json()

    const session = await prisma.session.update({
      where: { id },
      data: {
        status,
        endedAt: status === 'ENDED' ? new Date() : undefined,
      },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Erro em /api/sessions PATCH:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: id },
      include: {
        host: true,
        participants: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Erro detalhado no servidor:', error);
    // Retornar o erro como string ajuda a debugar no console do navegador
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}