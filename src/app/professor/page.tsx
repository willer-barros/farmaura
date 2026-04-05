'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfessorPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)

    // 1. Cria ou recupera o professor
    const userRes = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: `${name.toLowerCase().replace(/\s/g, '.')}@professor.farmaura` }),
    })
    const user = await userRes.json()

    // 2. Cria a sessão
    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sessionName, hostId: user.id }),
    })
    const session = await sessionRes.json()

    // 3. Salva no localStorage e redireciona
    localStorage.setItem('professorId', user.id)
    router.push(`/professor/session/${session.id}`)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 to-emerald-950 p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white">🌾 FarmAura</h1>
          <p className="text-emerald-300 mt-1">Painel do Professor</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-emerald-200 text-sm mb-1 block">Seu nome</label>
            <input
              type="text"
              placeholder="Ex: Prof. João"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="text-emerald-200 text-sm mb-1 block">Nome da aula</label>
            <input
              type="text"
              placeholder="Ex: Aula 3 – Revolução Francesa"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!name || !sessionName || loading}
            className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-emerald-950 font-bold rounded-xl py-3 transition-all"
          >
            {loading ? 'Criando...' : 'Criar sessão →'}
          </button>
        </div>
      </div>
    </main>
  )
}