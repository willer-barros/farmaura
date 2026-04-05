'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AlunoPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    setLoading(true)
    setError('')

    try {
      // 1. Cria ou recupera o aluno
      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: `${name.toLowerCase().replace(/\s/g, '.')}@aluno.farmaura`,
        }),
      })
      const user = await userRes.json()

      // 2. Busca a sessão pelo código
      const sessionRes = await fetch(`/api/sessions/code/${code.toUpperCase()}`)
      if (!sessionRes.ok) {
        setError('Código inválido ou sessão não encontrada.')
        setLoading(false)
        return
      }
      const session = await sessionRes.json()

      // 3. Entra na sessão (cria participante)
      await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, userId: user.id }),
      })

      // 4. Salva e redireciona
      localStorage.setItem('alunoId', user.id)
      localStorage.setItem('alunoName', user.name)
      router.push(`/aluno/sessao/${session.id}`)
    } catch {
      setError('Algo deu errado. Tente novamente.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-violet-900 to-indigo-950 p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white">🌾 FarmAura</h1>
          <p className="text-violet-300 mt-1">Entre na aula</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-violet-200 text-sm mb-1 block">Seu nome</label>
            <input
              type="text"
              placeholder="Ex: Maria Silva"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="text-violet-200 text-sm mb-1 block">Código da aula</label>
            <input
              type="text"
              placeholder="Ex: K3X9PQ"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400 font-mono text-xl tracking-widest uppercase"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleJoin}
            disabled={!name || code.length < 6 || loading}
            className="w-full bg-violet-400 hover:bg-violet-300 disabled:opacity-40 text-violet-950 font-bold rounded-xl py-3 transition-all"
          >
            {loading ? 'Entrando...' : 'Entrar na aula →'}
          </button>
        </div>
      </div>
    </main>
  )
}