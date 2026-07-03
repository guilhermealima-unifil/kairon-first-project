import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, Calendar, ShoppingBag, Sparkles, Package, Gauge, Heart, Gift } from 'lucide-react'
import { api } from '../api'
import Badge from '../components/Badge'

function initials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarColors = ['bg-indigo-500','bg-violet-500','bg-rose-500','bg-emerald-500','bg-amber-500','bg-sky-500']

function fmt(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [recs, setRecs] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/customers/${id}`),
      api.get(`/customers/${id}/recommendations`),
      api.get(`/customers/${id}/insights`),
    ]).then(([c, r, i]) => {
      setCustomer(c)
      setRecs(r)
      setInsights(i)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!customer) return <div className="text-center py-20 text-slate-400">Cliente não encontrado</div>

  const colorIdx = customer.name.charCodeAt(0) % avatarColors.length

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/clientes')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} /> Voltar para Clientes
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className={`w-16 h-16 rounded-2xl ${avatarColors[colorIdx]} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
            {initials(customer.name)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <Badge label={customer.segment} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
              {customer.email && (
                <span className="flex items-center gap-1.5"><Mail size={13} />{customer.email}</span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1.5"><Phone size={13} />{customer.phone}</span>
              )}
              <span className="flex items-center gap-1.5"><Calendar size={13} />Última visita: {customer.last_visit}</span>
            </div>
            {customer.notes && (
              <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 italic">"{customer.notes}"</p>
            )}
          </div>
          <div className="flex gap-4 sm:text-right">
            <div>
              <p className="text-2xl font-bold text-slate-900">{fmt(customer.total_spent || 0)}</p>
              <p className="text-xs text-slate-400">gasto total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{customer.orders?.length || 0}</p>
              <p className="text-xs text-slate-400">pedidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{customer.days_since_last_visit ?? '—'}</p>
              <p className="text-xs text-slate-400">dias desde última compra</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Purchase history */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">Histórico de Compras</h2>
          </div>
          {!customer.orders?.length ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum pedido ainda</p>
          ) : (
            <div className="space-y-4">
              {customer.orders.map(order => (
                <div key={order.id} className="border border-slate-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{order.id}</span>
                      <Badge label={order.status === 'completed' ? 'Concluído' : order.status} variant={order.status} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{fmt(order.total)}</p>
                      <p className="text-xs text-slate-400">{order.created_at}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1">
                        {item.product?.image ? (
                          <img src={item.product.image} alt="" className="w-6 h-6 rounded object-cover" />
                        ) : (
                          <Package size={14} className="text-slate-300" />
                        )}
                        <span className="text-xs text-slate-600">{item.product?.name || item.product_id}</span>
                        <span className="text-xs text-slate-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Insights / personalização */}
          {insights && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gauge size={16} className="text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-700">Insights do Cliente</h2>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">Risco de abandono</span>
                <Badge label={insights.risk.label} />
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${insights.risk.label === 'Alto' ? 'bg-rose-500' : insights.risk.label === 'Médio' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${insights.risk.score}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mb-4">
                {insights.risk.days_since_last_visit} dias sem visitar · {insights.risk.abandoned_count} evento(s) de abandono
              </p>

              <div className="flex items-start gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                <Gift size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700">{insights.suggested_offer}</p>
              </div>
            </div>
          )}

          {/* Interesses e Preferências */}
          {insights && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={16} className="text-rose-400" />
                <h2 className="text-sm font-semibold text-slate-700">Interesses e Preferências</h2>
              </div>
              {insights.favorite_category ? (
                <div className="flex items-center justify-between bg-rose-50 rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-xs text-slate-500">Categoria preferida</p>
                    <p className="text-sm font-semibold text-slate-800">{insights.favorite_category.category}</p>
                  </div>
                  <p className="text-xs text-rose-600 font-medium">{fmt(insights.favorite_category.spent)} gastos</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Ainda sem histórico de compras suficiente para identificar preferências.</p>
              )}
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-700">Recomendações</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Produtos que clientes com perfil similar compram</p>
            {!recs.length ? (
              <p className="text-xs text-slate-400 text-center py-6">Sem recomendações ainda. Mais pedidos geram melhores sugestões.</p>
            ) : (
              <div className="space-y-3">
                {recs.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{fmt(p.price)}</p>
                    </div>
                    <div className="text-xs font-bold text-indigo-500 flex-shrink-0">{p.stock}un</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
