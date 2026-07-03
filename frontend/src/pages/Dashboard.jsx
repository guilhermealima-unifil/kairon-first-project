import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingCart, AlertTriangle, Package } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { api } from '../api'
import StatsCard from '../components/StatsCard'
import PageHeader from '../components/PageHeader'
import { CATEGORY_COLORS, AT_RISK_DAYS_THRESHOLD } from '../constants'
import { useNavigate } from 'react-router-dom'

function fmt(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [salesByCategory, setSalesByCategory] = useState([])
  const [atRisk, setAtRisk] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/analytics/summary').then(setSummary).catch(console.error)
    api.get('/analytics/revenue').then(setRevenue).catch(console.error)
    api.get('/analytics/sales-by-category').then(setSalesByCategory).catch(console.error)
    api.get('/analytics/at-risk-customers').then(setAtRisk).catch(console.error)
  }, [])

  const stats = summary ? [
    { title: 'Receita do Mês', value: fmt(summary.revenue_month), icon: TrendingUp, color: 'indigo' },
    { title: 'Vendas do Mês', value: summary.orders_month, icon: ShoppingCart, color: 'emerald', subtitle: 'transações' },
    { title: 'Clientes em Risco', value: summary.at_risk_count, icon: AlertTriangle, color: 'amber', subtitle: `+${AT_RISK_DAYS_THRESHOLD} dias sem visita` },
    { title: 'Produtos', value: summary.total_products, icon: Package, color: 'purple', subtitle: `${summary.out_of_stock_count} sem estoque` },
  ] : []

  const lowStock = summary?.low_stock || []

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Visão geral do seu negócio" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatsCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Receita — últimos 7 dias</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `R$${v}`} width={48} />
              <Tooltip
                formatter={v => [fmt(v), 'Receita']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Vendas por Categoria</h2>
          {salesByCategory.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">Sem vendas registradas ainda</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" outerRadius={65} dataKey="revenue" nameKey="category">
                    {salesByCategory.map((d, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[d.category]?.hex || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, _, p) => [fmt(v), p.payload.category]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {salesByCategory.map(d => (
                  <div key={d.category} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[d.category]?.hex || '#94a3b8' }} />
                    <span className="text-xs text-slate-600">{d.category}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Clientes em Risco de Abandono</h2>
            <span className="text-xs font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">{atRisk.length} clientes</span>
          </div>
          {atRisk.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum cliente em risco no momento</p>
          ) : (
            <div className="space-y-2.5">
              {atRisk.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/clientes/${c.id}`)}
                  className="flex items-center gap-3 bg-amber-50 rounded-xl px-3.5 py-2.5 cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.days_since_last_visit} dias sem compra</p>
                  </div>
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Alertas de Estoque</h2>
            <span className="text-xs font-medium bg-rose-100 text-rose-700 rounded-full px-2.5 py-1">{lowStock.length} produtos</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum produto com estoque baixo</p>
          ) : (
            <div className="space-y-2.5">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-rose-50 rounded-xl px-3.5 py-2.5">
                  <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-rose-100">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rose-300">
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs font-mono text-slate-500">{p.sku}</p>
                  </div>
                  <span className="text-xs font-semibold bg-rose-100 text-rose-700 rounded-full px-2.5 py-1 flex-shrink-0">
                    {p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
