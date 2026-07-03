// Fonte única de verdade para valores que hoje são fixos mas que devem
// virar configuráveis (por usuário/loja) no futuro — mantidos aqui como
// constantes centralizadas para trocarmos por uma leitura de configuração
// (ex: tabela `settings`) sem caçar números mágicos espalhados pelas rotas.

const PRODUCT_CATEGORIES = [
  'Roupas',
  'Calçados',
  'Eletrônicos',
  'Alimentos',
  'Bebidas',
  'Casa',
  'Beleza',
  'Esportes',
  'Outros',
];

const AT_RISK_DAYS_THRESHOLD = 30;

const ATTENTION_DAYS_THRESHOLD = 15;

const VIP_SPEND_THRESHOLD = 500;

const REGULAR_SPEND_THRESHOLD = 100;

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

// Produtos poderão sobrescrever o limite de estoque baixo individualmente
// (ex: um item de giro rápido pode querer alertar com 10un, não 5). Até lá,
// cai no valor padrão.
function getLowStockThreshold(product) {
  return product?.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
}

module.exports = {
  PRODUCT_CATEGORIES,
  AT_RISK_DAYS_THRESHOLD,
  ATTENTION_DAYS_THRESHOLD,
  VIP_SPEND_THRESHOLD,
  REGULAR_SPEND_THRESHOLD,
  DEFAULT_LOW_STOCK_THRESHOLD,
  getLowStockThreshold,
};
