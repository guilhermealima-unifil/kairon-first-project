import { CATEGORY_COLORS } from '../constants'

const categoryVariants = Object.fromEntries(
  Object.entries(CATEGORY_COLORS).map(([category, { badge }]) => [category, badge])
)

const variants = {
  VIP: 'bg-amber-100 text-amber-800',
  Regular: 'bg-blue-100 text-blue-800',
  Novo: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  ...categoryVariants,
  'Em Estoque': 'bg-emerald-100 text-emerald-700',
  'Estoque Baixo': 'bg-amber-100 text-amber-700',
  'Sem Estoque': 'bg-rose-100 text-rose-700',
  Alto: 'bg-rose-100 text-rose-700',
  Médio: 'bg-amber-100 text-amber-700',
  Baixo: 'bg-emerald-100 text-emerald-700',
  Risco: 'bg-rose-100 text-rose-700',
  Atenção: 'bg-amber-100 text-amber-700',
  Ativo: 'bg-emerald-100 text-emerald-700',
  default: 'bg-slate-100 text-slate-700',
}

export default function Badge({ label, variant }) {
  const cls = variants[variant || label] || variants.default
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
