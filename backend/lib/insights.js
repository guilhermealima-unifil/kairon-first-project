// Heurísticas explicáveis (não é um modelo de ML) para dar o primeiro passo
// de "previsão" e "personalização" a partir dos dados que já existem:
// recência de visita, frequência de compra e eventos de abandono.

const { AT_RISK_DAYS_THRESHOLD, ATTENTION_DAYS_THRESHOLD, VIP_SPEND_THRESHOLD, REGULAR_SPEND_THRESHOLD } = require('./constants');

function daysBetween(a, b) {
  return Math.round((a - b) / 86400000);
}

function daysSinceLastVisit(customer) {
  return Math.max(0, daysBetween(new Date(), new Date(customer.last_visit)));
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

// Status simples de engajamento usado na listagem de Clientes — mesma ideia
// de recência do "cliente em risco" do Dashboard, com uma faixa intermediária.
function getCustomerStatus(daysSince) {
  if (daysSince > AT_RISK_DAYS_THRESHOLD) return 'Risco';
  if (daysSince >= ATTENTION_DAYS_THRESHOLD) return 'Atenção';
  return 'Ativo';
}

// Faixa de gasto usada na segmentação de clientes dos Relatórios.
function getSpendTier(totalSpent, orderCount) {
  if (orderCount === 0) return 'Nunca compraram';
  if (totalSpent >= VIP_SPEND_THRESHOLD) return 'VIP';
  if (totalSpent >= REGULAR_SPEND_THRESHOLD) return 'Regular';
  return 'Ocasional';
}

// Definição simples de "cliente em risco" usada no Dashboard: só a recência
// da última compra/visita, sem os fatores extras do score de churn (usado
// no perfil do cliente e em Relatórios). thresholdDays existe como parâmetro
// desde já para o dia em que isso virar configurável por loja.
function getAtRiskCustomers(db, thresholdDays = AT_RISK_DAYS_THRESHOLD) {
  return db.customers
    .map(c => {
      const totalSpent = db.orders.filter(o => o.customer_id === c.id).reduce((sum, o) => sum + o.total, 0);
      return { id: c.id, name: c.name, days_since_last_visit: daysSinceLastVisit(c), total_spent: totalSpent };
    })
    .filter(c => c.days_since_last_visit > thresholdDays)
    .sort((a, b) => b.days_since_last_visit - a.days_since_last_visit);
}

function riskLabel(score) {
  if (score >= 60) return 'Alto';
  if (score >= 30) return 'Médio';
  return 'Baixo';
}

function computeChurnRisk(customer, db) {
  const now = new Date();
  const lastVisit = new Date(customer.last_visit);
  const daysSinceVisit = Math.max(0, daysBetween(now, lastVisit));

  const orders = db.orders
    .filter(o => o.customer_id === customer.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  let score = 0;

  // Recência: quanto mais tempo sem aparecer, maior o risco.
  if (daysSinceVisit > 60) score += 45;
  else if (daysSinceVisit > 30) score += 30;
  else if (daysSinceVisit > 14) score += 15;

  // Frequência: compara o intervalo atual sem comprar com o intervalo médio
  // histórico do cliente. Se ele já demorou bem mais que o normal, é sinal
  // de queda de engajamento.
  if (orders.length >= 2) {
    const gaps = [];
    for (let i = 1; i < orders.length; i++) {
      gaps.push(daysBetween(new Date(orders[i].created_at), new Date(orders[i - 1].created_at)));
    }
    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    if (avgGap > 0 && daysSinceVisit > avgGap * 1.5) score += 25;
  } else if (orders.length === 0) {
    score += 20; // nunca comprou, só visitou/cadastrou
  } else {
    score += 10; // uma única compra ainda não estabelece um padrão
  }

  // Abandono: eventos recentes de "viu"/"adicionou ao carrinho" sem compra
  // sinalizam interesse não convertido.
  const abandonedCount = db.abandoned_events.filter(e => e.customer_id === customer.id).length;
  score += Math.min(abandonedCount * 8, 24);

  score = Math.min(100, Math.round(score));

  return {
    score,
    label: riskLabel(score),
    days_since_last_visit: daysSinceVisit,
    abandoned_count: abandonedCount,
    order_count: orders.length,
  };
}

function getFavoriteCategory(customerId, db) {
  const orderIds = new Set(db.orders.filter(o => o.customer_id === customerId).map(o => o.id));
  const spendByCategory = {};
  db.order_items
    .filter(oi => orderIds.has(oi.order_id))
    .forEach(oi => {
      const product = db.products.find(p => p.id === oi.product_id);
      if (!product) return;
      spendByCategory[product.category] = (spendByCategory[product.category] || 0) + oi.price * oi.quantity;
    });
  const [top] = Object.entries(spendByCategory).sort(([, a], [, b]) => b - a);
  return top ? { category: top[0], spent: Math.round(top[1] * 100) / 100 } : null;
}

function suggestOffer(customer, risk, favorite) {
  if (risk.label === 'Alto') {
    return favorite
      ? `Cliente sumindo — oferecer 15% de desconto em ${favorite.category} para reativar.`
      : 'Cliente sumindo — oferecer cupom de reativação.';
  }
  if (customer.segment === 'VIP' && risk.label === 'Baixo') {
    return favorite
      ? `Cliente VIP engajado — dar acesso antecipado a novidades de ${favorite.category}.`
      : 'Cliente VIP engajado — dar acesso antecipado a novas coleções.';
  }
  if (favorite) {
    return `Enviar novidades e recomendações de ${favorite.category}, categoria favorita do cliente.`;
  }
  return 'Ainda sem dados suficientes para uma oferta personalizada.';
}

module.exports = {
  computeChurnRisk,
  getFavoriteCategory,
  suggestOffer,
  daysSinceLastVisit,
  getAtRiskCustomers,
  calculateAge,
  getCustomerStatus,
  getSpendTier,
};
