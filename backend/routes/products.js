const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDb, saveDb } = require('../db');
const { computeHash, similarity, getOrComputeProductHash } = require('../lib/imageHash');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Reconhecimento de produto por foto: identifica um item do catálogo a
// partir de uma foto tirada por um funcionário (celular ou webcam), em vez
// de precisar digitar nome/SKU. Usa um "fingerprint" visual (dHash) em vez
// de um serviço externo de visão computacional, então funciona offline e
// sem chave de API — suficiente para reconhecer o mesmo produto já
// cadastrado a partir de um ângulo/foto diferente.
router.post('/identify', uploadMemory.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Envie uma foto no campo "photo"' });

  const db = getDb();
  let queryHash;
  try {
    queryHash = await computeHash(req.file.buffer);
  } catch {
    return res.status(400).json({ error: 'Não foi possível processar a imagem enviada' });
  }

  const matches = [];
  let dbChanged = false;
  for (const product of db.products) {
    const hadHash = !!product.image_hash;
    const hash = await getOrComputeProductHash(product);
    if (!hadHash && product.image_hash) dbChanged = true;
    if (!hash) continue;
    matches.push({ ...product, similarity: Math.round(similarity(queryHash, hash) * 1000) / 10 });
  }

  if (dbChanged) saveDb(db);

  matches.sort((a, b) => b.similarity - a.similarity);
  const top = matches.slice(0, 5);
  const bestMatch = top[0] && top[0].similarity >= 80;

  res.json({ matches: top, best_match: bestMatch ? top[0] : null });
});

router.get('/', (req, res) => {
  const db = getDb();
  let { search, category } = req.query;
  let products = db.products;
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }
  if (category) products = products.filter(p => p.category === category);
  res.json(products);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(product);
});

router.post('/', upload.single('image'), async (req, res) => {
  const db = getDb();
  const { name, sku, price, stock, category, description, image } = req.body;
  const newProduct = {
    id: `p${Date.now()}`,
    name,
    sku,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    description: description || '',
    image: req.file ? `/uploads/${req.file.filename}` : (image || ''),
    created_at: new Date().toISOString().split('T')[0],
  };
  await getOrComputeProductHash(newProduct);
  db.products.unshift(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const db = getDb();
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Produto não encontrado' });
  const { name, sku, price, stock, category, description, image } = req.body;
  const newImage = req.file ? `/uploads/${req.file.filename}` : (image || db.products[idx].image);
  const imageChanged = newImage !== db.products[idx].image;
  db.products[idx] = {
    ...db.products[idx],
    name: name || db.products[idx].name,
    sku: sku || db.products[idx].sku,
    price: price !== undefined ? parseFloat(price) : db.products[idx].price,
    stock: stock !== undefined ? parseInt(stock) : db.products[idx].stock,
    category: category || db.products[idx].category,
    description: description !== undefined ? description : db.products[idx].description,
    image: newImage,
    image_hash: imageChanged ? undefined : db.products[idx].image_hash,
  };
  if (imageChanged) await getOrComputeProductHash(db.products[idx]);
  saveDb(db);
  res.json(db.products[idx]);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDb(db);
  res.json({ ok: true });
});

module.exports = router;
