// src/components/ChampionReveal.tsx
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'

export function ChampionReveal({ champion }: { champion: Participant }) {
  return (
    <>
      <Confetti recycle={false} numberOfPieces={400} />
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.img
          src={champion.user.avatarUrl}
          className="w-40 h-40 rounded-full border-8 border-yellow-400 shadow-2xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <h1 className="text-5xl font-black text-yellow-300">
          👑 {champion.user.name}
        </h1>
        <p className="text-2xl text-white/80">
          {champion.aura} auras acumuladas!
        </p>
      </motion.div>
    </>
  )
}