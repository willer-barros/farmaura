'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

type Participant = {
  userId: string
  aura: number
  user: { id: string; name: string; avatarUrl: string | null }
}

export default function AlunoRankingFinal() {
  const { id } = useParams<{ id: string }>()
  const [ranking, setRanking] = useState<Participant[]>([])
  const [alunoId, setAlunoId] = useState<string | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setAlunoId(localStorage.getItem('alunoId'))
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    fetch(`/api/ranking/final?sessionId=${id}`)
      .then(r => r.json())
      .then(setRanking)
  }, [id])

  const myPosition = ranking.findIndex(p => p.userId === alunoId) + 1
  const isChampion = myPosition === 1

  return (
    <main className="min-h-screen bg-linear-to-br from-violet-900 to-indigo-950 flex flex-col items-center justify-center p-6">

      {isChampion && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
        />
      )}

      <div className="w-full max-w-lg flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {isChampion ? (
            <>
              <div className="text-6xl mb-2">👑</div>
              <h1 className="text-4xl font-black text-yellow-300">Você ganhou!</h1>
              <p className="text-white/70 mt-1">Parabéns, campeão da aula!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-2">🏁</div>
              <h1 className="text-4xl font-black text-white">Fim da aula!</h1>
              <p className="text-violet-300 mt-1">
                Você terminou em {myPosition}º lugar
              </p>
            </>
          )}
        </motion.div>

        <div className="flex flex-col gap-3">
          {ranking.map((p, i) => (
            <motion.div
              key={p.userId}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className={`flex items-center gap-3 p-4 rounded-2xl ${
                p.userId === alunoId
                  ? 'bg-violet-400/30 ring-2 ring-violet-400'
                  : 'bg-white/10'
              }`}
            >
              <span className="text-2xl w-8 text-center">
                {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>
              <img
                src={p.user.avatarUrl ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId}`}
                className="w-10 h-10 rounded-full"
                alt={p.user.name}
              />
              <span className={`flex-1 font-medium ${p.userId === alunoId ? 'text-violet-200 font-bold' : 'text-white'}`}>
                {p.user.name}
                {p.userId === alunoId && ' (você)'}
              </span>
              <span className="text-yellow-300 font-bold">✨ {p.aura}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}