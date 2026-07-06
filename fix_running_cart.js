// Selectively recolor only cart structure layers in running-cart.json to gold
// Cart layers: Manubrio (handle), carretilla (body), Llanta 1/2 (wheels), base
// Items/boxes (caja, lines) stay their original colors
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'assets', 'running-cart.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const GOLD = [0.831, 0.686, 0.216];
const ORIGINAL_DARK = [0.2078, 0.2078, 0.2078];

// Cart structure layer names that should be gold
const CART_LAYERS = ['Manubrio', 'carretilla', 'Llanta 1', 'Llanta 2', 'base'];

function setColor(shapes, color) {
  if (!Array.isArray(shapes)) return;
  for (const shape of shapes) {
    if ((shape.ty === 'st' || shape.ty === 'fl') && shape.c) {
      if (shape.c.a === 0 && Array.isArray(shape.c.k)) {
        shape.c.k = [...color];
      } else if (shape.c.a === 1 && Array.isArray(shape.c.k)) {
        for (const kf of shape.c.k) {
          if (kf.s) kf.s = [...color];
          if (kf.e) kf.e = [...color];
        }
      }
    }
    if (shape.ty === 'gr' && Array.isArray(shape.it)) {
      setColor(shape.it, color);
    }
  }
}

for (const layer of data.layers) {
  if (!Array.isArray(layer.shapes)) continue;
  
  if (CART_LAYERS.includes(layer.nm)) {
    // Gold for cart structure
    setColor(layer.shapes, GOLD);
    console.log(`  GOLD: ${layer.nm}`);
  } else {
    // Restore original dark for everything else (items, lines, boxes, ground)
    setColor(layer.shapes, ORIGINAL_DARK);
    console.log(`  DARK: ${layer.nm}`);
  }
}

fs.writeFileSync(file, JSON.stringify(data));
console.log('Done: running-cart.json selectively recolored.');
