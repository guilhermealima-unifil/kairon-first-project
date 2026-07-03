import { useState, useEffect } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { api } from '../api'
import CustomerCard from '../components/CustomerCard'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'

const SEGMENTS = ['VIP', 'Regular', 'Novo']

function CustomerForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', segment: 'Novo', notes: '' })
  const [loading, setLoading] = useState(false)
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const created = await api.post('/customers', form)
      onSave(created)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Nome *</label>
        <input className={input} value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input className={input} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
          <input className={input} value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Segmento</label>
        <div className="flex gap-2">
          {SEGMENTS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => set('segment', s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.segment === s ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
        <textarea className={`${input} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors">
          {loading ? 'Salvando...' : 'Cadastrar Cliente'}
        </button>
      </div>
    </form>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)

  async function load() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const data = await api.get(`/customers?${params}`)
    setCustomers(data)
  }

  useEffect(() => { load() }, [search])

  const statusCounts = customers.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clientes"
        subtitle={`${customers.length} clientes cadastrados`}
        action={
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Plus size={16} /> Novo Cliente
          </button>
        }
      />

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          placeholder="Buscar por nome, CPF, telefone ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
          Ativo: {statusCounts['Ativo'] || 0}
        </span>
        <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
          Atenção: {statusCounts['Atenção'] || 0}
        </span>
        <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-rose-100 text-rose-700">
          Risco: {statusCounts['Risco'] || 0}
        </span>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Users size={40} className="mb-3 opacity-40" />
          <p className="text-sm">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map(c => <CustomerCard key={c.id} customer={c} />)}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Novo Cliente">
        <CustomerForm
          onSave={c => { setCustomers(prev => [c, ...prev]); setModal(false) }}
          onClose={() => setModal(false)}
        />
      </Modal>
    </div>
  )
}
