const express = require('express');
const { getDb, saveDb } = require('../db');
const { computeChurnRisk, getFavoriteCategory, suggestOffer, daysSinceLastVisit, calculateAge, getCustomerStatus } = require('../lib/insights');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  let { search, segment } = req.query;
  let customers = db.customers;
  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.cpf || '').includes(q)
    );
  }
  if (segment) customers = customers.filter(c => c.segment === segment);

  const enriched = customers.map(c => {
    const orders = db.orders.filter(o => o.customer_id === c.id);
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const risk = computeChurnRisk(c, db);
    const daysSince = daysSinceLastVisit(c);
    return {
      ...c,
      age: calculateAge(c.birth_date),
      status: getCustomerStatus(daysSince),
      days_since_last_visit: daysSince,
      order_count: orders.length,
      total_spent: totalSpent,
      risk_score: risk.score,
      risk_label: risk.label,
    };
  });
  res.json(enriched);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });

  const orders = db.orders
    .filter(o => o.customer_id === customer.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(order => {
      const items = db.order_items
        .filter(oi => oi.order_id === order.id)
        .map(oi => ({ ...oi, product: db.products.find(p => p.id === oi.product_id) }));
      return { ...order, items };
    });

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const daysSince = daysSinceLastVisit(customer);
  res.json({
    ...customer,
    age: calculateAge(customer.birth_date),
    status: getCustomerStatus(daysSince),
    days_since_last_visit: daysSince,
    orders,
    total_spent: totalSpent,
  });
});

router.get('/:id/insights', (req, res) => {
  const db = getDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });

  const risk = computeChurnRisk(customer, db);
  const favorite_category = getFavoriteCategory(customer.id, db);
  const suggested_offer = suggestOffer(customer, risk, favorite_category);

  res.json({ risk, favorite_category, suggested_offer });
});

router.get('/:id/recommendations', (req, res) => {
  const db = getDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });

  const customerOrderIds = db.orders
    .filter(o => o.customer_id === req.params.id)
    .map(o => o.id);

  const purchasedProductIds = new Set(
    db.order_items
      .filter(oi => customerOrderIds.includes(oi.order_id))
      .map(oi => oi.product_id)
  );

  const relatedOrderIds = new Set(
    db.order_items
      .filter(oi => purchasedProductIds.has(oi.product_id))
      .map(oi => oi.order_id)
  );

  const coPurchaseCounts = {};
  db.order_items
    .filter(oi => relatedOrderIds.has(oi.order_id) && !purchasedProductIds.has(oi.product_id))
    .forEach(oi => {
      coPurchaseCounts[oi.product_id] = (coPurchaseCounts[oi.product_id] || 0) + 1;
    });

  const recommendations = Object.entries(coPurchaseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([productId, score]) => ({ ...db.products.find(p => p.id === productId), score }))
    .filter(Boolean);

  if (recommendations.length < 3) {
    const topProducts = db.order_items.reduce((acc, oi) => {
      if (!purchasedProductIds.has(oi.product_id)) {
        acc[oi.product_id] = (acc[oi.product_id] || 0) + 1;
      }
      return acc;
    }, {});
    const extras = Object.entries(topProducts)
      .sort(([, a], [, b]) => b - a)
      .filter(([id]) => !recommendations.find(r => r.id === id))
      .slice(0, 5 - recommendations.length)
      .map(([id, score]) => ({ ...db.products.find(p => p.id === id), score }))
      .filter(Boolean);
    recommendations.push(...extras);
  }

  res.json(recommendations);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, email, phone, segment, notes } = req.body;
  const newCustomer = {
    id: `c${Date.now()}`,
    name,
    email: email || '',
    phone: phone || '',
    segment: segment || 'Novo',
    notes: notes || '',
    created_at: new Date().toISOString().split('T')[0],
    last_visit: new Date().toISOString().split('T')[0],
  };
  db.customers.unshift(newCustomer);
  saveDb(db);
  res.status(201).json(newCustomer);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const idx = db.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cliente não encontrado' });
  db.customers[idx] = { ...db.customers[idx], ...req.body };
  saveDb(db);
  res.json(db.customers[idx]);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.customers = db.customers.filter(c => c.id !== req.params.id);
  saveDb(db);
  res.json({ ok: true });
});

module.exports = router;
