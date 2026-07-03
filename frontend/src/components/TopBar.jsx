import { useLocation } from 'react-router-dom'
import { Bell, User } from 'lucide-react'

const TITLES = {
  '/': 'Dashboard',
  '/produtos': 'Produtos',
  '/clientes': 'Clientes',
  '/caixa': 'PDV / Vendas',
  '/relatorios': 'Relatórios',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || (pathname.startsWith('/clientes/') ? 'Perfil do Cliente' : 'Kairon')

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-20 xl:px-32 2xl:px-40 flex-shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      </div>
    </header>
  )
}
