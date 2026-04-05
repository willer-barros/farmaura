'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type Participant = {
  userId: string
  aura: number
  user: { id: string; name: string; avatarUrl: string | null }
}

export default function AlunoSessaoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [ranking, setRanking] = useState<Participant[]>([])
  const [alunoId, setAlunoId] = useState<string | null>(null)
  const [alunoName, setAlunoName] = useState<string>('')
  const [prevAura, setPrevAura] = useState<number>(0)
  const [showBurst, setShowBurst] = useState(false)

  useEffect(() => {
    setAlunoId(localStorage.getItem('alunoId'))
    setAlunoName(localStorage.getItem('alunoName') ?? '')
  }, [])

  // SSE — ranking em tempo real + detecta fim da sessão
  useEffect(() => {
    const es = new EventSource(`/api/ranking?sessionId=${id}`)

    es.onmessage = async (e) => {
      const data: Participant[] = JSON.parse(e.data)
      setRanking(data)

      // Detecta ganho de aura para animação
      if (alunoId) {
        const me = data.find(p => p.userId === alunoId)
        if (me && me.aura > prevAura) {
          setShowBurst(true)
          setTimeout(() => setShowBurst(false), 1200)
          setPrevAura(me.aura)
        }
      }

      // Verifica se a sessão foi encerrada
      const sessionRes = await fetch(`/api/sessions/${id}`)
      const sessionData = await sessionRes.json()
      if (sessionData.status === 'ENDED') {
        es.close()
        router.push(`/aluno/sessao/${id}/ranking`)
      }
    }

    return () => es.close()
  }, [id, alunoId, prevAura, router])

  const me = ranking.find(p => p.userId === alunoId)
  const myPosition = ranking.findIndex(p => p.userId === alunoId) + 1

  return (
    <main className="min-h-screen bg-linear-to-br from-violet-900 to-indigo-950 p-6">
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        {/* Card do aluno */}
        <motion.div
          className="bg-white/10 backdrop-blur rounded-3xl p-6 flex flex-col items-center gap-4 relative overflow-hidden"
          animate={showBurst ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence>
            {showBurst && (
              <motion.div
                key="burst"
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-yellow-300/20 rounded-3xl pointer-events-none"
              />
            )}
          </AnimatePresence>

          <img
            src={me?.user.avatarUrl ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${alunoId}`}
            className="w-24 h-24 rounded-full bg-white/20"
            alt={alunoName}
          />

          <div className="text-center">
            <h2 className="text-2xl font-black text-white">{alunoName}</h2>
            <p className="text-violet-300">
              {myPosition > 0 ? `${myPosition}º lugar` : 'Aguardando...'}
            </p>
          </div>

          <motion.div
            className="flex items-center gap-2"
            animate={showBurst ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <span className="text-5xl font-black text-yellow-300">
              {me?.aura ?? 0}
            </span>
            <span className="text-yellow-300 text-2xl">✨</span>
          </motion.div>

          <AnimatePresence>
            {showBurst && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-yellow-300 font-bold text-lg absolute bottom-4"
              >
                +Aura recebida!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Ranking */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">🏆 Ranking da aula</h3>
          <ul className="flex flex-col gap-3">
            <AnimatePresence>
              {ranking.map((p, i) => (
                <motion.li
                  key={p.userId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    p.userId === alunoId
                      ? 'bg-violet-400/30 ring-2 ring-violet-400'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="text-xl w-8 text-center">
                    {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <img
                    src={p.user.avatarUrl ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId}`}
                    className="w-9 h-9 rounded-full bg-white/20"
                    alt={p.user.name}
                  />
                  <span className={`flex-1 font-medium ${p.userId === alunoId ? 'text-violet-200' : 'text-white'}`}>
                    {p.user.name}
                    {p.userId === alunoId && ' (você)'}
                  </span>
                  <span className="text-yellow-300 font-bold">✨ {p.aura}</span>
                </motion.li>
              ))}
            </AnimatePresence>

            {ranking.length === 0 && (
              <p className="text-white/40 text-center py-6">
                Aguardando participantes...
              </p>
            )}
          </ul>
        </div>
      </div>
    </main>
  )
}