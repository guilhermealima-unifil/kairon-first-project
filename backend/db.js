const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

const SEED = {
  products: [
    { id: 'p1', name: 'Blazer Linho Azul', sku: 'BLZ-001', price: 299.90, stock: 12, category: 'Roupas', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', description: 'Blazer premium em linho azul, ideal para ocasiões formais e casuais.', created_at: '2026-01-15' },
    { id: 'p2', name: 'Camisa Social Branca', sku: 'CAM-002', price: 129.90, stock: 25, category: 'Roupas', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', description: 'Camisa social 100% algodão, corte clássico.', created_at: '2026-01-15' },
    { id: 'p3', name: 'Calça Slim Preta', sku: 'CAL-003', price: 199.90, stock: 8, category: 'Roupas', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80', description: 'Calça slim fit em tecido premium, corte moderno.', created_at: '2026-01-20' },
    { id: 'p4', name: 'Cinto Couro Marrom', sku: 'CIN-004', price: 89.90, stock: 30, category: 'Outros', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=80', description: 'Cinto artesanal em couro genuíno, fivela dourada.', created_at: '2026-02-01' },
    { id: 'p5', name: 'Relógio Prata', sku: 'REL-005', price: 459.90, stock: 5, category: 'Outros', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', description: 'Relógio clássico com caixa prateada e pulseira de couro.', created_at: '2026-02-10' },
    { id: 'p6', name: 'Oxford Couro Preto', sku: 'SAP-006', price: 349.90, stock: 7, category: 'Calçados', image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80', description: 'Sapato oxford em couro legítimo, acabamento artesanal.', created_at: '2026-02-15' },
    { id: 'p7', name: 'Óculos Aviador', sku: 'OC-007', price: 249.90, stock: 15, category: 'Outros', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', description: 'Óculos estilo aviador com lentes polarizadas.', created_at: '2026-03-01' },
    { id: 'p8', name: 'Gravata Seda Bordô', sku: 'GRA-008', price: 79.90, stock: 20, category: 'Outros', image: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=400&q=80', description: 'Gravata de seda pura, cor bordô, ideal para eventos formais.', created_at: '2026-03-10' },
    { id: 'p9', name: 'Lenço de Bolso', sku: 'LEN-009', price: 39.90, stock: 40, category: 'Outros', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&q=80', description: 'Lenço de bolso em algodão pima, acabamento bordado.', created_at: '2026-03-15' },
    { id: 'p10', name: 'Mocassim Caramelo', sku: 'MOC-010', price: 289.90, stock: 3, category: 'Calçados', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80', description: 'Mocassim em couro caramelo, sola em borracha natural.', created_at: '2026-04-01' },
  ],
  customers: [
    { id: 'c1', name: 'Ana Costa', email: 'ana.costa@email.com', phone: '(11) 98765-4321', segment: 'VIP', cpf: '123.456.789-01', birth_date: '1998-03-14', gender: 'Feminino', created_at: '2026-01-10', last_visit: '2026-06-01', notes: 'Prefere roupas formais, tamanho M' },
    { id: 'c2', name: 'Bruno Lima', email: 'bruno.lima@email.com', phone: '(11) 97654-3210', segment: 'VIP', cpf: '234.567.891-02', birth_date: '1985-07-22', gender: 'Masculino', created_at: '2026-01-20', last_visit: '2026-05-28', notes: 'Cliente fiel, presente em eventos corporativos' },
    { id: 'c3', name: 'Carla Santos', email: 'carla.s@email.com', phone: '(11) 96543-2109', segment: 'Regular', cpf: '345.678.912-03', birth_date: '1990-11-02', gender: 'Feminino', created_at: '2026-02-05', last_visit: '2026-05-15', notes: '' },
    { id: 'c4', name: 'Daniel Oliveira', email: 'daniel.o@email.com', phone: '(11) 95432-1098', segment: 'Regular', cpf: '456.789.123-04', birth_date: '1979-05-30', gender: 'Masculino', created_at: '2026-02-20', last_visit: '2026-04-30', notes: 'Gosta de peças clássicas' },
    { id: 'c5', name: 'Eva Martins', email: 'eva.m@email.com', phone: '(11) 94321-0987', segment: 'Novo', cpf: '567.891.234-05', birth_date: '2001-09-18', gender: 'Feminino', created_at: '2026-04-10', last_visit: '2026-05-20', notes: 'Primeira compra em abril' },
    { id: 'c6', name: 'Felipe Alves', email: 'felipe.a@email.com', phone: '(11) 93210-9876', segment: 'Regular', cpf: '678.912.345-06', birth_date: '1993-01-27', gender: 'Masculino', created_at: '2026-03-01', last_visit: '2026-06-02', notes: '' },
    { id: 'c7', name: 'Gabriela Ferreira', email: 'gabi.f@email.com', phone: '(11) 92109-8765', segment: 'VIP', cpf: '789.123.456-07', birth_date: '1988-12-05', gender: 'Feminino', created_at: '2026-01-05', last_visit: '2026-06-04', notes: 'Compra mensalmente, gosta de novidades' },
    { id: 'c8', name: 'Henrique Rocha', email: 'henrique.r@email.com', phone: '(11) 91098-7654', segment: 'Novo', cpf: '891.234.567-08', birth_date: '1996-06-09', gender: 'Masculino', created_at: '2026-05-01', last_visit: '2026-05-25', notes: 'Interesse em acessórios' },
  ],
  orders: [
    { id: 'o1', customer_id: 'c1', total: 519.70, status: 'completed', payment_method: 'Pix', created_at: '2026-04-10' },
    { id: 'o2', customer_id: 'c1', total: 429.80, status: 'completed', payment_method: 'Crédito', created_at: '2026-05-15' },
    { id: 'o3', customer_id: 'c2', total: 689.50, status: 'completed', payment_method: 'Dinheiro', created_at: '2026-04-20' },
    { id: 'o4', customer_id: 'c2', total: 199.90, status: 'completed', payment_method: 'Débito', created_at: '2026-05-28' },
    { id: 'o5', customer_id: 'c3', total: 249.70, status: 'completed', payment_method: 'Pix', created_at: '2026-04-25' },
    { id: 'o6', customer_id: 'c4', total: 629.70, status: 'completed', payment_method: 'Crédito', created_at: '2026-04-30' },
    { id: 'o7', customer_id: 'c5', total: 709.80, status: 'completed', payment_method: 'Dinheiro', created_at: '2026-04-10' },
    { id: 'o8', customer_id: 'c6', total: 569.70, status: 'completed', payment_method: 'Débito', created_at: '2026-05-10' },
    { id: 'o9', customer_id: 'c7', total: 1259.30, status: 'completed', payment_method: 'Pix', created_at: '2026-05-20' },
    { id: 'o10', customer_id: 'c7', total: 199.90, status: 'completed', payment_method: 'Crédito', created_at: '2026-06-04' },
    { id: 'o11', customer_id: 'c8', total: 709.80, status: 'completed', payment_method: 'Dinheiro', created_at: '2026-05-25' },
    { id: 'o12', customer_id: 'c1', total: 129.90, status: 'completed', payment_method: 'Débito', created_at: '2026-06-01' },
    { id: 'o13', customer_id: 'c3', total: 349.90, status: 'completed', payment_method: 'Pix', created_at: '2026-05-15' },
    { id: 'o14', customer_id: 'c6', total: 89.90, status: 'completed', payment_method: 'Crédito', created_at: '2026-06-02' },
    { id: 'o15', customer_id: 'c2', total: 429.80, status: 'completed', payment_method: 'Pix', created_at: '2026-03-10' },
  ],
  order_items: [
    { id: 'oi1', order_id: 'o1', product_id: 'p1', quantity: 1, price: 299.90 },
    { id: 'oi2', order_id: 'o1', product_id: 'p2', quantity: 1, price: 129.90 },
    { id: 'oi3', order_id: 'o1', product_id: 'p4', quantity: 1, price: 89.90 },
    { id: 'oi4', order_id: 'o2', product_id: 'p6', quantity: 1, price: 349.90 },
    { id: 'oi5', order_id: 'o2', product_id: 'p8', quantity: 1, price: 79.90 },
    { id: 'oi6', order_id: 'o3', product_id: 'p1', quantity: 1, price: 299.90 },
    { id: 'oi7', order_id: 'o3', product_id: 'p3', quantity: 1, price: 199.90 },
    { id: 'oi8', order_id: 'o3', product_id: 'p4', quantity: 1, price: 89.90 },
    { id: 'oi9', order_id: 'o3', product_id: 'p9', quantity: 1, price: 39.90 },
    { id: 'oi10', order_id: 'o4', product_id: 'p3', quantity: 1, price: 199.90 },
    { id: 'oi11', order_id: 'o5', product_id: 'p2', quantity: 1, price: 129.90 },
    { id: 'oi12', order_id: 'o5', product_id: 'p8', quantity: 1, price: 79.90 },
    { id: 'oi13', order_id: 'o5', product_id: 'p9', quantity: 1, price: 39.90 },
    { id: 'oi14', order_id: 'o6', product_id: 'p1', quantity: 1, price: 299.90 },
    { id: 'oi15', order_id: 'o6', product_id: 'p2', quantity: 1, price: 129.90 },
    { id: 'oi16', order_id: 'o6', product_id: 'p3', quantity: 1, price: 199.90 },
    { id: 'oi17', order_id: 'o7', product_id: 'p5', quantity: 1, price: 459.90 },
    { id: 'oi18', order_id: 'o7', product_id: 'p7', quantity: 1, price: 249.90 },
    { id: 'oi19', order_id: 'o8', product_id: 'p2', quantity: 1, price: 129.90 },
    { id: 'oi20', order_id: 'o8', product_id: 'p4', quantity: 1, price: 89.90 },
    { id: 'oi21', order_id: 'o8', product_id: 'p6', quantity: 1, price: 349.90 },
    { id: 'oi22', order_id: 'o9', product_id: 'p1', quantity: 1, price: 299.90 },
    { id: 'oi23', order_id: 'o9', product_id: 'p2', quantity: 1, price: 129.90 },
    { id: 'oi24', order_id: 'o9', product_id: 'p3', quantity: 1, price: 199.90 },
    { id: 'oi25', order_id: 'o9', product_id: 'p4', quantity: 1, price: 89.90 },
    { id: 'oi26', order_id: 'o9', product_id: 'p5', quantity: 1, price: 459.90 },
    { id: 'oi27', order_id: 'o9', product_id: 'p8', quantity: 1, price: 79.90 },
    { id: 'oi28', order_id: 'o10', product_id: 'p3', quantity: 1, price: 199.90 },
    { id: 'oi29', order_id: 'o11', product_id: 'p5', quantity: 1, price: 459.90 },
    { id: 'oi30', order_id: 'o11', product_id: 'p7', quantity: 1, price: 249.90 },
    { id: 'oi31', order_id: 'o12', product_id: 'p2', quantity: 1, price: 129.90 },
    { id: 'oi32', order_id: 'o13', product_id: 'p6', quantity: 1, price: 349.90 },
    { id: 'oi33', order_id: 'o14', product_id: 'p4', quantity: 1, price: 89.90 },
    { id: 'oi34', order_id: 'o15', product_id: 'p6', quantity: 1, price: 349.90 },
    { id: 'oi35', order_id: 'o15', product_id: 'p8', quantity: 1, price: 79.90 },
  ],
  abandoned_events: [
    { id: 'ae1', customer_id: 'c2', product_id: 'p5', timestamp: '2026-06-01T14:30:00Z', stage: 'visualizou' },
    { id: 'ae2', customer_id: 'c3', product_id: 'p1', timestamp: '2026-06-02T10:15:00Z', stage: 'adicionou ao carrinho' },
    { id: 'ae3', customer_id: 'c4', product_id: 'p7', timestamp: '2026-06-03T16:45:00Z', stage: 'visualizou' },
    { id: 'ae4', customer_id: 'c5', product_id: 'p6', timestamp: '2026-06-04T11:00:00Z', stage: 'adicionou ao carrinho' },
    { id: 'ae5', customer_id: 'c8', product_id: 'p1', timestamp: '2026-06-05T09:30:00Z', stage: 'visualizou' },
    { id: 'ae6', customer_id: 'c1', product_id: 'p10', timestamp: '2026-06-05T15:20:00Z', stage: 'visualizou' },
    { id: 'ae7', customer_id: 'c6', product_id: 'p5', timestamp: '2026-06-06T08:45:00Z', stage: 'adicionou ao carrinho' },
  ],
};

function getDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch {}
  return JSON.parse(JSON.stringify(SEED));
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { getDb, saveDb };
