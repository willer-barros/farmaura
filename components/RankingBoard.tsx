// src/components/RankingBoard.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Participant = {
  userId: string
  aura: number
  user: { name: string; avatarUrl?: string }
}

export function RankingBoard({ sessionId }: { sessionId: string }) {
  const [ranking, setRanking] = useState<Participant[]>([])

  useEffect(() => {
    const es = new EventSource(`/api/ranking?sessionId=${sessionId}`)
    es.onmessage = (e) => setRanking(JSON.parse(e.data))
    return () => es.close()
  }, [sessionId])

  return (
    <ul className="space-y-3">
      <AnimatePresence>
        {ranking.map((p, i) => (
          <motion.li
            key={p.userId}
            layout                        // ← reordena com animação suave
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur"
          >
            <span className="text-2xl font-bold w-8 text-center">
              {i === 0 ? '👑' : i + 1}
            </span>
            <img
              src={p.user.avatarUrl ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId}`}
              className="w-10 h-10 rounded-full"
              alt={p.user.name}
            />
            <span className="flex-1 font-semibold">{p.user.name}</span>
            <span className="text-yellow-300 font-bold text-xl">
              ✨ {p.aura}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}