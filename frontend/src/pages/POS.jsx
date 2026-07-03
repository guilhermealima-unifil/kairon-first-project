import { useState, useEffect } from 'react'
import { Search, Plus, Minus, Trash2, CheckCircle, Package, User, ShoppingCart } from 'lucide-react'
import { api } from '../api'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

function fmt(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const PAYMENT_METHODS = ['Dinheiro', 'Crédito', 'Débito', 'Pix']

export default function POS() {
  const [productSearch, setProductSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const q = productSearch.trim()
      api.get(q ? `/products?search=${encodeURIComponent(q)}` : '/products').then(setProducts).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [productSearch])

  useEffect(() => {
    if (!customerSearch.trim()) { setCustomers([]); return }
    const t = setTimeout(() => {
      api.get(`/customers?search=${customerSearch}`).then(setCustomers).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [customerSearch])

  function addToCart(product) {
    if (product.stock === 0) return
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id)
      if (exists) {
        if (exists.qty >= product.stock) return prev
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { product, qty: 1 }]
    })
  }

  function changeQty(productId, delta) {
    setCart(prev =>
      prev.map(i => i.product.id === productId ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.product.stock)) } : i)
    )
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  async function checkout() {
    if (!cart.length) return
    setLoading(true)
    try {
      await api.post('/orders', {
        customer_id: selectedCustomer?.id || null,
        items: cart.map(i => ({ product_id: i.product.id, quantity: i.qty })),
        payment_method: paymentMethod,
      })
      setSuccess(true)
      setCart([])
      setSelectedCustomer(null)
      setPaymentMethod(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Venda Concluída!</h2>
        <p className="text-slate-500 text-sm">Pedido registrado com sucesso.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader title="PDV — Ponto de Venda" subtitle="Registre vendas e vincule clientes" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Cliente + Produtos */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cliente */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-800">Cliente</h2>
            </div>
            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-indigo-900">{selectedCustomer.name}</p>
                  <p className="text-xs text-indigo-600">{selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-xs text-indigo-500 hover:text-indigo-700">Trocar</button>
              </div>
            ) : (
              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Buscar cliente por nome ou CPF..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                />
                {customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {customers.slice(0, 5).map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); setCustomers([]) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-sm transition-colors"
                      >
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <Badge label={c.segment} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Produtos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-800">Produtos</h2>
            </div>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Buscar produto ou código..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum produto encontrado</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                {products.map(p => (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`flex items-center gap-3 border border-slate-100 rounded-xl p-2.5 transition-colors ${
                      p.stock === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-50/60 hover:border-indigo-200'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="m-auto mt-3.5 text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">Estoque: {p.stock}</p>
                      <p className="text-sm font-bold text-indigo-600">{fmt(p.price)}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(p) }}
                      disabled={p.stock === 0}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Carrinho */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-800">Carrinho</h2>
            </div>
            <span className="text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-1">{cart.length} itens</span>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum produto adicionado</p>
          ) : (
            <div className="space-y-2 mb-4">
              {cart.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-slate-200">
                    {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="m-auto mt-2.5 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-xs text-slate-400">{fmt(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => changeQty(product.id, -1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-indigo-300 transition-colors">
                      <Minus size={11} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-slate-800">{qty}</span>
                    <button onClick={() => changeQty(product.id, 1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-indigo-300 transition-colors">
                      <Plus size={11} />
                    </button>
                    <button onClick={() => removeFromCart(product.id)} className="w-6 h-6 rounded-lg text-rose-400 hover:bg-rose-50 flex items-center justify-center transition-colors ml-0.5">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">Pagamento</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    paymentMethod === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-xl font-bold text-slate-900">{fmt(total)}</span>
            </div>

            <button
              onClick={checkout}
              disabled={loading || !cart.length}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Processando...' : 'Finalizar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
