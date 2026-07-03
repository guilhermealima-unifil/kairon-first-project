// Service worker mínimo: apenas repassa as requisições à rede. Existe só
// para tornar o app instalável (PWA) no celular, sem cache/offline por
// enquanto — evita servir dados desatualizados de estoque/preço.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
