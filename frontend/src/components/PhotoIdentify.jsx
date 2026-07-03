import { useRef, useState } from 'react'
import { Camera, Loader2, Package, X } from 'lucide-react'
import { api } from '../api'

function fmt(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

// Reconhece um produto já cadastrado a partir de uma foto (celular/webcam),
// para não depender de digitar nome/SKU na hora de vender ou repor estoque.
export default function PhotoIdentify({ label = 'Identificar por foto', onSelect }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { matches, best_match } | null
  const [error, setError] = useState('')
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const data = await api.post('/products/identify', fd)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function pick(product) {
    onSelect?.(product)
    setResult(null)
  }

  return (
    <div className="relative">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current.click()}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
        {loading ? 'Identificando...' : label}
      </button>

      {(result || error) && (
        <div className="absolute top-full left-0 mt-1 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">Resultado da identificação</p>
            <button onClick={() => { setResult(null); setError('') }} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>

          {error && <p className="text-xs text-rose-500 py-2">{error}</p>}

          {result && result.matches.length === 0 && (
            <p className="text-xs text-slate-400 py-2">Nenhum produto parecido encontrado.</p>
          )}

          {result && result.matches.length > 0 && (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {result.matches.map(p => (
                <button
                  key={p.id}
                  onClick={() => pick(p)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package size={14} className="m-auto mt-2.5 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{fmt(p.price)}</p>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${p.similarity >= 80 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {p.similarity}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
