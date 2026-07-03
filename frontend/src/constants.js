// Espelha backend/lib/constants.js. Centralizado aqui para o dia em que
// isso vier de uma API de configurações em vez de estar hardcoded.
export const PRODUCT_CATEGORIES = [
  'Roupas',
  'Calçados',
  'Eletrônicos',
  'Alimentos',
  'Bebidas',
  'Casa',
  'Beleza',
  'Esportes',
  'Outros',
]

export const AT_RISK_DAYS_THRESHOLD = 30

export const ATTENTION_DAYS_THRESHOLD = 15

export const VIP_SPEND_THRESHOLD = 500

export const REGULAR_SPEND_THRESHOLD = 100

export const DEFAULT_LOW_STOCK_THRESHOLD = 5

// Cor única por categoria, reaproveitada no gráfico de pizza do Dashboard e
// nos badges de produto — assim as duas telas concordam visualmente.
export const CATEGORY_COLORS = {
  Roupas: { hex: '#3b82f6', badge: 'bg-blue-100 text-blue-700' },
  Calçados: { hex: '#ef4444', badge: 'bg-red-100 text-red-700' },
  Eletrônicos: { hex: '#8b5cf6', badge: 'bg-purple-100 text-purple-700' },
  Alimentos: { hex: '#84cc16', badge: 'bg-lime-100 text-lime-700' },
  Bebidas: { hex: '#06b6d4', badge: 'bg-cyan-100 text-cyan-700' },
  Casa: { hex: '#14b8a6', badge: 'bg-teal-100 text-teal-700' },
  Beleza: { hex: '#10b981', badge: 'bg-emerald-100 text-emerald-700' },
  Esportes: { hex: '#f59e0b', badge: 'bg-amber-100 text-amber-700' },
  Outros: { hex: '#94a3b8', badge: 'bg-slate-200 text-slate-700' },
}
