import { Edit2, Trash2, Package, Tag } from 'lucide-react'
import { DEFAULT_LOW_STOCK_THRESHOLD } from '../constants'

function stockInfo(product) {
  const threshold = product.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD
  if (product.stock === 0) return { label: 'Sem estoque', cls: 'bg-rose-100 text-rose-700' }
  if (product.stock <= threshold) return { label: `Pouco: ${product.stock}`, cls: 'bg-amber-100 text-amber-700' }
  return { label: `${product.stock} un.`, cls: 'bg-emerald-100 text-emerald-700' }
}

export default function ProductCard({ product, onEdit, onDelete, readonly }) {
  const stock = stockInfo(product)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-square bg-slate-100 overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Package size={40} />
          </div>
        )}
        {!readonly && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(product)} className="p-1.5 bg-white rounded-lg shadow text-slate-600 hover:text-indigo-600 hover:shadow-md transition-all">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(product.id)} className="p-1.5 bg-white rounded-lg shadow text-slate-600 hover:text-rose-600 hover:shadow-md transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p title={product.name} className="font-semibold text-slate-900 text-sm leading-tight truncate">{product.name}</p>
          <span className="text-sm font-bold text-indigo-600 flex-shrink-0 whitespace-nowrap">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-0.5">#{product.sku}</p>
        <div className="flex items-center justify-between gap-2 mt-2.5">
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full flex-shrink-0">
            <Tag size={10} /> {product.category}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 truncate ${stock.cls}`}>
            {stock.label}
          </span>
        </div>
      </div>
    </div>
  )
}
