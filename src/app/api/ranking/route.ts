// src/app/api/ranking/route.ts
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')!

  // Server-Sent Events: atualiza o ranking a cada 2 segundos
  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const ranking = await prisma.sessionParticipant.findMany({
          where: { sessionId },
          orderBy: { aura: 'desc' },
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        })

        const data = `data: ${JSON.stringify(ranking)}\n\n`
        controller.enqueue(new TextEncoder().encode(data))
      }

      await send()
      const interval = setInterval(send, 2000)

      // Limpa quando o cliente desconectar
      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}