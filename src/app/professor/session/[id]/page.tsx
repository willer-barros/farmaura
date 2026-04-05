'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type Participant = {
  userId: string
  aura: number
  user: { id: string; name: string; avatarUrl: string | null }
}

type Session = {
  id: string
  name: string
  code: string
  status: string
}

const AURA_REASONS = [
  { label: '✅ Respondeu quiz', value: 'QUIZ_ANSWER', amount: 10 },
  { label: '🙋 Participou', value: 'ACTIVITY', amount: 5 },
  { label: '⭐ Bônus', value: 'BONUS', amount: 15 },
]

export default function SessaoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [ranking, setRanking] = useState<Participant[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [ending, setEnding] = useState(false)

  // Carrega dados da sessão
  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then(r => r.json())
      .then(setSession)
  }, [id])

  // SSE — ranking em tempo real
  useEffect(() => {
    const es = new EventSource(`/api/ranking?sessionId=${id}`)
    es.onmessage = e => setRanking(JSON.parse(e.data))
    return () => es.close()
  }, [id])

  async function giveAura(userId: string, reason: string, amount: number) {
    await fetch('/api/aura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id, userId, amount, reason }),
    })
  }

  async function endSession() {
    setEnding(true)
    await fetch('/api/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'ENDED' }),
    })
    router.push(`/professor/sessao/${id}/ranking`)
  }

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 text-white">
      Carregando...
    </div>
  )

  return (
    <main className="min-h-screen bg-linear-to-br from-green-900 to-emerald-950 p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{session.name}</h1>
            <p className="text-emerald-300">
              Código da sala:{' '}
              <span className="font-mono font-bold text-yellow-300 text-xl tracking-widest">
                {session.code}
              </span>
            </p>
          </div>
          <button
            onClick={endSession}
            disabled={ending}
            className="bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white font-bold rounded-xl px-6 py-3 transition-all"
          >
            {ending ? 'Encerrando...' : '🏁 Encerrar aula'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Ranking ao vivo */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">
              🏆 Ranking ao vivo — {ranking.length} alunos
            </h2>
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
                    onClick={() => setSelected(selected === p.userId ? null : p.userId)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selected === p.userId
                        ? 'bg-emerald-400/30 ring-2 ring-emerald-400'
                        : 'bg-white/5 hover:bg-white/10'
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
                    <span className="flex-1 text-white font-medium">{p.user.name}</span>
                    <span className="text-yellow-300 font-bold">✨ {p.aura}</span>
                  </motion.li>
                ))}
              </AnimatePresence>

              {ranking.length === 0 && (
                <p className="text-white/40 text-center py-8">
                  Aguardando alunos entrarem...
                </p>
              )}
            </ul>
          </div>

          {/* Distribuir aura */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-2">⚡ Distribuir aura</h2>
            <p className="text-emerald-300 text-sm mb-4">
              {selected
                ? `Selecionado: ${ranking.find(p => p.userId === selected)?.user.name}`
                : 'Clique num aluno no ranking para selecionar'}
            </p>

            <div className="flex flex-col gap-3">
              {AURA_REASONS.map(r => (
                <button
                  key={r.value}
                  disabled={!selected}
                  onClick={() => selected && giveAura(selected, r.value, r.amount)}
                  className="flex items-center justify-between bg-emerald-500/20 hover:bg-emerald-500/40 disabled:opacity-30 text-white rounded-xl px-4 py-3 transition-all"
                >
                  <span>{r.label}</span>
                  <span className="text-yellow-300 font-bold">+{r.amount} ✨</span>
                </button>
              ))}
            </div>

            {/* Aura manual */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-emerald-200 text-sm mb-2">Valor personalizado</p>
              <div className="flex gap-2">
                <input
                  id="custom-amount"
                  type="number"
                  placeholder="Ex: 20"
                  className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  disabled={!selected}
                  onClick={() => {
                    const input = document.getElementById('custom-amount') as HTMLInputElement
                    const amount = parseInt(input.value)
                    if (selected && amount > 0) {
                      giveAura(selected, 'TEACHER_MANUAL', amount)
                      input.value = ''
                    }
                  }}
                  className="bg-emerald-400 hover:bg-emerald-300 disabled:opacity-30 text-emerald-950 font-bold rounded-xl px-4 py-2 transition-all"
                >
                  Dar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}