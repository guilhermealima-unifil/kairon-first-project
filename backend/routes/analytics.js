const express = require('express');
const { getDb } = require('../db');
const { computeChurnRisk, getAtRiskCustomers, getSpendTier } = require('../lib/insights');
const { getLowStockThreshold, AT_RISK_DAYS_THRESHOLD } = require('../lib/constants');

const router = express.Router();

router.get('/summary', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const monthPrefix = today.slice(0, 7); // "YYYY-MM"

  const todayOrders = db.orders.filter(o => o.created_at === today);
  const monthOrders = db.orders.filter(o => o.created_at.startsWith(monthPrefix));
  const revenueToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const revenueMonth = monthOrders.reduce((sum, o) => sum + o.total, 0);
  const totalRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = db.products.filter(p => p.stock <= getLowStockThreshold(p));
  const outOfStock = db.products.filter(p => p.stock === 0);

  res.json({
    total_products: db.products.length,
    total_customers: db.customers.length,
    total_orders: db.orders.length,
    orders_today: todayOrders.length,
    orders_month: monthOrders.length,
    revenue_today: revenueToday,
    revenue_month: revenueMonth,
    total_revenue: totalRevenue,
    low_stock_count: lowStock.length,
    low_stock: lowStock,
    out_of_stock_count: outOfStock.length,
    at_risk_count: getAtRiskCustomers(db).length,
    vip_customers: db.customers.filter(c => c.segment === 'VIP').length,
  });
});

// "Cliente em risco" aqui é só recência (dias desde a última visita/compra),
// mais simples que o score multi-fator usado no perfil do cliente/Relatórios.
// ?days= permite testar outro limite antes disso virar configurável de fato.
router.get('/at-risk-customers', (req, res) => {
  const db = getDb();
  const days = req.query.days ? parseInt(req.query.days) : AT_RISK_DAYS_THRESHOLD;
  res.json(getAtRiskCustomers(db, days));
});

router.get('/sales-by-category', (req, res) => {
  const db = getDb();
  const revenueByCategory = {};
  db.order_items.forEach(oi => {
    const product = db.products.find(p => p.id === oi.product_id);
    if (!product) return;
    revenueByCategory[product.category] = (revenueByCategory[product.category] || 0) + oi.price * oi.quantity;
  });
  const result = Object.entries(revenueByCategory)
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
  res.json(result);
});

router.get('/revenue', (req, res) => {
  const db = getDb();
  const days = req.query.days ? parseInt(req.query.days) : 7;
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOrders = db.orders.filter(o => o.created_at === dateStr);
    result.push({
      date: dateStr,
      revenue: Math.round(dayOrders.reduce((s, o) => s + o.total, 0) * 100) / 100,
      orders: dayOrders.length,
    });
  }
  res.json(result);
});

router.get('/top-products', (req, res) => {
  const db = getDb();
  const counts = {};
  db.order_items.forEach(oi => {
    counts[oi.product_id] = (counts[oi.product_id] || 0) + oi.quantity;
  });
  const top = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id, qty]) => {
      const p = db.products.find(p => p.id === id);
      return { ...p, sold: qty };
    })
    .filter(Boolean);
  res.json(top);
});

// Segmenta por gasto real (histórico de pedidos), não pelo rótulo livre
// "segment" do cadastro — é o valor que efetivamente reflete o comportamento
// do cliente na loja.
router.get('/segments', (req, res) => {
  const db = getDb();
  const tiers = { VIP: 0, Regular: 0, Ocasional: 0, 'Nunca compraram': 0 };
  db.customers.forEach(c => {
    const orders = db.orders.filter(o => o.customer_id === c.id);
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const tier = getSpendTier(totalSpent, orders.length);
    tiers[tier]++;
  });
  res.json(Object.entries(tiers).map(([name, value]) => ({ name, value })));
});

router.get('/payments', (req, res) => {
  const db = getDb();
  const counts = {};
  db.orders.forEach(o => {
    const method = o.payment_method || 'Não informado';
    counts[method] = (counts[method] || 0) + 1;
  });
  res.json(Object.entries(counts).map(([method, count]) => ({ method, count })));
});

// Agrupa receita pelo gênero real cadastrado no cliente (campo `gender`),
// não por um valor fixo — pedidos sem cliente vinculado ou sem gênero
// informado caem em "Sem Perfil".
router.get('/revenue-by-gender', (req, res) => {
  const db = getDb();
  const revenueByGender = {};
  db.orders.forEach(o => {
    const customer = db.customers.find(c => c.id === o.customer_id);
    const gender = customer?.gender || 'Sem Perfil';
    revenueByGender[gender] = (revenueByGender[gender] || 0) + o.total;
  });
  const result = Object.entries(revenueByGender)
    .map(([gender, revenue]) => ({ gender, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
  res.json(result);
});

router.get('/abandonment', (req, res) => {
  const db = getDb();
  const events = db.abandoned_events.map(ev => ({
    ...ev,
    customer: db.customers.find(c => c.id === ev.customer_id),
    product: db.products.find(p => p.id === ev.product_id),
  }));
  const byStage = events.reduce((acc, ev) => {
    acc[ev.stage] = (acc[ev.stage] || 0) + 1;
    return acc;
  }, {});
  res.json({ events, by_stage: byStage });
});

router.get('/churn-risk', (req, res) => {
  const db = getDb();
  const ranked = db.customers
    .map(c => ({ ...c, risk: computeChurnRisk(c, db) }))
    .sort((a, b) => b.risk.score - a.risk.score)
    .slice(0, 5);
  res.json(ranked);
});

module.exports = router;
