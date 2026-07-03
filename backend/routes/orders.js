const express = require('express');
const { getDb, saveDb } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const orders = db.orders
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50)
    .map(order => {
      const customer = db.customers.find(c => c.id === order.customer_id);
      const items = db.order_items
        .filter(oi => oi.order_id === order.id)
        .map(oi => ({ ...oi, product: db.products.find(p => p.id === oi.product_id) }));
      return { ...order, customer, items };
    });
  res.json(orders);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { customer_id, items, payment_method } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Pedido deve ter pelo menos 1 item' });
  }

  for (const item of items) {
    const product = db.products.find(p => p.id === item.product_id);
    if (!product) return res.status(400).json({ error: `Produto ${item.product_id} não encontrado` });
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Estoque insuficiente para ${product.name}` });
    }
  }

  const orderId = `o${Date.now()}`;
  let total = 0;
  const orderItems = items.map((item, i) => {
    const product = db.products.find(p => p.id === item.product_id);
    total += product.price * item.quantity;
    product.stock -= item.quantity;
    return {
      id: `oi${Date.now()}${i}`,
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const order = {
    id: orderId,
    customer_id: customer_id || null,
    total: Math.round(total * 100) / 100,
    status: 'completed',
    payment_method: payment_method || null,
    created_at: new Date().toISOString().split('T')[0],
  };

  db.orders.unshift(order);
  db.order_items.push(...orderItems);

  if (customer_id) {
    const cIdx = db.customers.findIndex(c => c.id === customer_id);
    if (cIdx !== -1) db.customers[cIdx].last_visit = order.created_at;
  }

  saveDb(db);
  res.status(201).json({ ...order, items: orderItems });
});

module.exports = router;
