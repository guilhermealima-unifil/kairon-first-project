const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// dHash (difference hash): resize to 9x8, compare each pixel to its right
// neighbor. Produces a 64-bit fingerprint that's robust to resizing/
// re-encoding, so a phone photo of a product matches its catalog image.
async function loadImageBuffer(source) {
  if (!source) return null;
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Falha ao baixar imagem: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const filePath = path.join(__dirname, '..', source.replace(/^\/+/, ''));
  return fs.readFileSync(filePath);
}

async function computeHash(bufferOrPath) {
  const img = await Jimp.read(bufferOrPath);
  img.resize(9, 8).grayscale();
  let hash = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = Jimp.intToRGBA(img.getPixelColor(x, y)).r;
      const right = Jimp.intToRGBA(img.getPixelColor(x + 1, y)).r;
      hash += left < right ? '1' : '0';
    }
  }
  return hash;
}

function hammingDistance(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function similarity(a, b) {
  return 1 - hammingDistance(a, b) / a.length;
}

// Computes and caches product.image_hash in place. Returns the hash, or
// null if the image can't be loaded (missing upload, dead remote URL, etc.)
async function getOrComputeProductHash(product) {
  if (product.image_hash) return product.image_hash;
  if (!product.image) return null;
  try {
    const buf = await loadImageBuffer(product.image);
    const hash = await computeHash(buf);
    product.image_hash = hash;
    return hash;
  } catch {
    return null;
  }
}

module.exports = { loadImageBuffer, computeHash, hammingDistance, similarity, getOrComputeProductHash };
