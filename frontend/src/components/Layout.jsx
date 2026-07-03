import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Onboarding from './Onboarding'
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart2 } from 'lucide-react'

const MOBILE_NAV = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/caixa', label: 'Caixa', icon: ShoppingCart },
  { to: '/relatorios', label: 'Dados', icon: BarChart2 },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 md:px-6 md:py-6 lg:px-20 xl:px-32 2xl:px-40 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-30">
        {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <Onboarding />
    </div>
  )
}
