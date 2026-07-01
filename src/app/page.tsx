import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-indigo-950 p-6 gap-12">

      {/* Logo */}
      <div className="text-center">
        <h1 className="text-6xl font-black text-white drop-shadow-lg">
          🌾 FarmAura
        </h1>
        <p className="text-emerald-300 text-lg mt-2">
          Gamificação para sua sala de aula
        </p>
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Link
          href="/professor"
          className="flex-1 flex flex-col items-center gap-3 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 hover:border-emerald-400 text-white rounded-3xl p-8 transition-all group"
        >
          <span className="text-5xl group-hover:scale-110 transition-transform">
            👨‍🏫
          </span>
          <span className="font-bold text-xl">Sou Professor</span>
          <span className="text-emerald-300 text-sm text-center">
            Criar e gerenciar sessões de aula
          </span>
        </Link>

        <Link
          href="/aluno"
          className="flex-1 flex flex-col items-center gap-3 bg-violet-500/20 hover:bg-violet-500/40 border border-violet-500/40 hover:border-violet-400 text-white rounded-3xl p-8 transition-all group"
        >
          <span className="text-5xl group-hover:scale-110 transition-transform">
            🎒
          </span>
          <span className="font-bold text-xl">Sou Aluno</span>
          <span className="text-violet-300 text-sm text-center">
            Entrar em uma sessão com código
          </span>
        </Link>
      </div>

      <p className="text-white/20 text-sm">
        FarmAura © {new Date().getFullYear()}
      </p>
    </main>
  )
}