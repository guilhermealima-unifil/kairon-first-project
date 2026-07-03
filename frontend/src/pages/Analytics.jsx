import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { api } from '../api'
import { AlertTriangle, Package, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { VIP_SPEND_THRESHOLD } from '../constants'

function fmt(v) { return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

function initials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const KPI_COLORS = { blue: 'text-blue-600', green: 'text-emerald-600', orange: 'text-amber-600', purple: 'text-purple-600' }

function Kpi({ value, label, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <p className={`text-2xl font-bold ${KPI_COLORS[color]}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}

const PAYMENT_COLORS = { Pix: '#3b82f6', Crédito: '#f59e0b', Dinheiro: '#10b981', Débito: '#8b5cf6', 'Não informado': '#94a3b8' }
const TIER_COLORS = { VIP: 'bg-purple-100 text-purple-700', Regular: 'bg-blue-100 text-blue-700', Ocasional: 'bg-emerald-100 text-emerald-700', 'Nunca compraram': 'bg-slate-200 text-slate-600' }
const TIER_LABELS = { VIP: 'VIP (R$500+)', Regular: 'Regular (R$100-499)', Ocasional: 'Ocasional (<R$100)', 'Nunca compraram': 'Nunca compraram' }
const GENDER_COLORS = { Feminino: '#ec4899', Masculino: '#3b82f6', 'Sem Perfil': '#f59e0b' }

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [customers, setCustomers] = useState([])
  const [revenue, setRevenue] = useState([])
  const [payments, setPayments] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [segments, setSegments] = useState([])
  const [revenueByGender, setRevenueByGender] = useState([])
  const [atRisk, setAtRisk] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/customers'),
      api.get('/analytics/revenue?days=30'),
      api.get('/analytics/payments'),
      api.get('/analytics/top-products'),
      api.get('/analytics/segments'),
      api.get('/analytics/revenue-by-gender'),
      api.get('/analytics/at-risk-customers'),
    ]).then(([sum, cust, rev, pay, top, seg, gender, risk]) => {
      setSummary(sum)
      setCustomers(cust)
      setRevenue(rev)
      setPayments(pay)
      setTopProducts(top)
      setSegments(seg)
      setRevenueByGender(gender)
      setAtRisk(risk)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />
        ))}
      </div>
    )
  }

  const ticketMedio = summary.total_orders > 0 ? summary.total_revenue / summary.total_orders : 0
  const vipCount = customers.filter(c => (c.total_spent || 0) >= VIP_SPEND_THRESHOLD).length

  const paymentData = payments.map(p => ({ name: p.method, value: p.count }))
  const maxSegment = Math.max(...segments.map(s => s.value), 1)
  const maxGenderRevenue = Math.max(...revenueByGender.map(g => g.revenue), 1)

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios & Insights" subtitle="Análise do desempenho do seu negócio" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi value={fmt(summary.total_revenue).replace(/,\d{2}$/, '')} label="Receita Total" color="blue" />
        <Kpi value={fmt(ticketMedio)} label="Ticket Médio" color="green" />
        <Kpi value={atRisk.length} label="Clientes em Risco" color="orange" />
        <Kpi value={vipCount} label="Clientes VIP" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Receita — Últimos 30 dias</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" interval={4} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `R$${v}`} width={52} />
              <Tooltip formatter={v => [fmt(v), 'Receita']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Pagamentos</h2>
          {paymentData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">Sem vendas registradas ainda</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name">
                    {paymentData.map((d, i) => <Cell key={i} fill={PAYMENT_COLORS[d.name] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip formatter={(v, _, p) => [v, p.payload.name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {paymentData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PAYMENT_COLORS[d.name] || '#94a3b8' }} />
                    <span className="text-xs text-slate-600">{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Produtos Mais Vendidos</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={110} />
              <Tooltip formatter={v => [v, 'Unidades vendidas']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="sold" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Segmentação de Clientes</h2>
          </div>
          <div className="space-y-3 mb-5">
            {segments.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 w-40 text-center ${TIER_COLORS[s.name] || 'bg-slate-100 text-slate-600'}`}>
                  {TIER_LABELS[s.name] || s.name}
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(s.value / maxSegment) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-800 w-6 text-right flex-shrink-0">{s.value}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Receita por Gênero</h3>
          {revenueByGender.length === 0 ? (
            <p className="text-xs text-slate-400">Sem dados suficientes ainda</p>
          ) : (
            <div className="space-y-2.5">
              {revenueByGender.map(g => (
                <div key={g.gender} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 w-20 flex-shrink-0 truncate">{g.gender}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(g.revenue / maxGenderRevenue) * 100}%`, background: GENDER_COLORS[g.gender] || '#94a3b8' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 flex-shrink-0">{fmt(g.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-700">Clientes em Risco de Abandono</h2>
          </div>
          <span className="text-xs font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">{atRisk.length} clientes</span>
        </div>
        {atRisk.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhum cliente em risco no momento</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {atRisk.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {initials(c.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.days_since_last_visit} dias sem compra</p>
                  <p className="text-xs text-slate-500">Total gasto: {fmt(c.total_spent)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
