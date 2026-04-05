'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'

type Participant = {
  userId: string
  aura: number
  user: { id: string; name: string; avatarUrl: string | null }
}

export default function RankingFinalPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [ranking, setRanking] = useState<Participant[]>([])
  const [phase, setPhase] = useState<'loading' | 'suspense' | 'reveal' | 'podium'>('loading')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    fetch(`/api/ranking/final?sessionId=${id}`)
      .then(r => r.json())
      .then(data => {
        setRanking(data)
        setPhase('suspense')
      })
  }, [id])

  // Sequência de animação
  useEffect(() => {
    if (phase === 'suspense') {
      const t1 = setTimeout(() => setPhase('reveal'), 3000)
      return () => clearTimeout(t1)
    }
    if (phase === 'reveal') {
      const t2 = setTimeout(() => setPhase('podium'), 2500)
      return () => clearTimeout(t2)
    }
  }, [phase])

  const champion = ranking[0]
  const rest = ranking.slice(1)

  return (
    <main className="min-h-screen bg-linear-to-br from-yellow-900 via-amber-900 to-orange-950 flex flex-col items-center justify-center p-6 overflow-hidden">

      {/* Confetti só no reveal */}
      {(phase === 'reveal' || phase === 'podium') && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={phase === 'reveal'}
          numberOfPieces={300}
          colors={['#fbbf24', '#f59e0b', '#10b981', '#6366f1', '#ec4899']}
        />
      )}

      {/* FASE: loading */}
      {phase === 'loading' && (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white text-2xl font-bold"
        >
          Calculando resultados...
        </motion.p>
      )}

      {/* FASE: suspense */}
      <AnimatePresence>
        {phase === 'suspense' && (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-8xl"
            >
              🏆
            </motion.div>
            <h1 className="text-4xl font-black text-white">
              E o campeão da aula é...
            </h1>
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="flex gap-2"
            >
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-yellow-300" />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FASE: reveal do campeão */}
      <AnimatePresence>
        {phase === 'reveal' && champion && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-7xl"
            >
              👑
            </motion.div>

            <motion.img
              src={champion.user.avatarUrl ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${champion.userId}`}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                y: [0, -12, 0],
              }}
              transition={{
                scale: { type: 'spring', stiffness: 200, delay: 0.2 },
                y: { repeat: Infinity, duration: 2, delay: 0.5 },
              }}
              className="w-40 h-40 rounded-full border-8 border-yellow-400 shadow-2xl shadow-yellow-500/50"
              alt={champion.user.name}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-5xl font-black text-white drop-shadow-lg">
                {champion.user.name}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-yellow-300 text-2xl font-bold mt-2"
              >
                ✨ {champion.aura} auras acumuladas!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FASE: pódio completo */}
      <AnimatePresence>
        {phase === 'podium' && (
          <motion.div
            key="podium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-lg flex flex-col gap-6"
          >
            <h2 className="text-3xl font-black text-white text-center">
              🏆 Resultado Final
            </h2>

            {/* Top 3 destaque */}
            <div className="flex flex-col gap-3">
              {ranking.slice(0, 3).map((p, i) => (
                <motion.div
                  key={p.userId}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl ${
                    i === 0
                      ? 'bg-yellow-400/30 ring-2 ring-yellow-400'
                      : i === 1
                      ? 'bg-gray-400/20 ring-1 ring-gray-400'
                      : 'bg-orange-400/20 ring-1 ring-orange-400'
                  }`}
                >
                  <span className="text-3xl">
                    {i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'}
                  </span>
                  <img
                    src={p.user.avatarUrl ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId}`}
                    className="w-12 h-12 rounded-full"
                    alt={p.user.name}
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">{p.user.name}</p>
                    <p className="text-white/60 text-sm">{i + 1}º lugar</p>
                  </div>
                  <span className="text-yellow-300 font-black text-xl">
                    ✨ {p.aura}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Restante */}
            {rest.length > 2 && (
              <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-2">
                {rest.slice(2).map((p, i) => (
                  <motion.div
                    key={p.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0"
                  >
                    <span className="text-white/50 w-6 text-center text-sm">{i + 4}</span>
                    <img
                      src={p.user.avatarUrl ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId}`}
                      className="w-8 h-8 rounded-full"
                      alt={p.user.name}
                    />
                    <span className="flex-1 text-white/80 text-sm">{p.user.name}</span>
                    <span className="text-yellow-300/80 text-sm">✨ {p.aura}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Botão nova aula */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => router.push('/professor')}
              className="w-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-2xl py-4 text-lg transition-all"
            >
              🌾 Nova aula
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}