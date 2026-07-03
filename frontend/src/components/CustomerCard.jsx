import { useNavigate } from 'react-router-dom'
import { Phone, Mail, ChevronRight } from 'lucide-react'
import Badge from './Badge'

function initials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarColors = [
  'bg-indigo-500', 'bg-violet-500', 'bg-rose-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-sky-500',
]

function fmt(v) { return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function CustomerCard({ customer }) {
  const navigate = useNavigate()
  const colorIdx = customer.name.charCodeAt(0) % avatarColors.length

  const details = [
    customer.cpf && `CPF: ${customer.cpf}`,
    customer.age != null && `${customer.age} anos`,
    customer.gender,
  ].filter(Boolean)

  return (
    <div
      onClick={() => navigate(`/clientes/${customer.id}`)}
      className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
    >
      <div className={`w-11 h-11 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
        {initials(customer.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-900">{customer.name}</p>
          {customer.status && <Badge label={customer.status} />}
        </div>
        {details.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
            {details.map((d, i) => <span key={i}>{d}</span>)}
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
          {customer.phone && (
            <span className="flex items-center gap-1"><Phone size={12} />{customer.phone}</span>
          )}
          {customer.email && (
            <span className="flex items-center gap-1"><Mail size={12} />{customer.email}</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="text-base font-bold text-indigo-600">{fmt(customer.total_spent)}</p>
        <p className="text-xs text-slate-400">total gasto</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
    </div>
  )
}
