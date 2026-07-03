import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Package, Users, ShoppingCart, BarChart2 } from 'lucide-react'

const STEPS = [
  {
    icon: LayoutDashboard,
    title: 'Bem-vindo ao Kairon!',
    description: 'O sistema que une seu ERP e CRM em uma única plataforma. Relacione produtos com clientes e tome decisões com dados reais.',
    color: 'bg-indigo-500',
  },
  {
    icon: Package,
    title: 'Catálogo de Produtos',
    description: 'Gerencie seus produtos com fotos. Nunca mais dependa de códigos — sua equipe vê exatamente o que está vendendo.',
    color: 'bg-violet-500',
  },
  {
    icon: Users,
    title: 'Perfil de Clientes',
    description: 'Cada cliente tem um histórico de compras completo. Veja o que ele comprou, quando visitou e receba sugestões de produtos personalizadas.',
    color: 'bg-emerald-500',
  },
  {
    icon: ShoppingCart,
    title: 'Caixa Mobile',
    description: 'No celular, consulte estoque e feche vendas rapidamente. Desktop para gerenciar, mobile para atender — cada um em seu lugar.',
    color: 'bg-amber-500',
  },
  {
    icon: BarChart2,
    title: 'Relatórios e Previsões',
    description: 'Entenda por que clientes abandonam a loja, quais produtos vendem mais e como segmentar sua base para ações personalizadas.',
    color: 'bg-rose-500',
  },
]

export default function Onboarding() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem('kairon_onboarding_done')
    if (!done) setOpen(true)
  }, [])

  function finish() {
    localStorage.setItem('kairon_onboarding_done', '1')
    setOpen(false)
  }

  if (!open) return (
    <button
      onClick={() => { setStep(0); setOpen(true) }}
      className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-40 bg-indigo-600 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
    >
      Tutorial
    </button>
  )

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`${current.color} p-8 flex flex-col items-center text-white`}>
          <div className="bg-white/20 p-4 rounded-2xl mb-4">
            <Icon size={32} />
          </div>
          <h2 className="text-xl font-bold text-center">{current.title}</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-600 text-center leading-relaxed">{current.description}</p>
          <div className="flex justify-center gap-1.5 mt-5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                <ChevronLeft size={16} /> Anterior
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium">
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={finish} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium">
                Começar!
              </button>
            )}
          </div>
          <button onClick={finish} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors">
            Pular tutorial
          </button>
        </div>
        <button onClick={finish} className="absolute top-3 right-3 p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
