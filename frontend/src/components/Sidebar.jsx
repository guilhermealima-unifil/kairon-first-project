import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/caixa', label: 'PDV / Vendas', icon: ShoppingCart },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart2 },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`hidden md:flex flex-col bg-slate-900 text-white transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'} flex-shrink-0`}>
      <div className={`flex items-center h-14 px-5 border-b border-slate-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-white">
            <span className="text-indigo-400">K</span>airon
          </span>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div className="p-5 border-t border-slate-800">
          <div className="text-xs text-slate-500">Kairon MVP v1.0</div>
          <div className="text-xs text-slate-600">Hackathon 2026</div>
        </div>
      )}
    </aside>
  )
}
