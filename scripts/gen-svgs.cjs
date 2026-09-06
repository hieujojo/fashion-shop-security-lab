const fs = require('fs');
const path = require('path');

const products = [
  { id: 1, name: 'Slim-fit Denim Jacket', category: 'men' },
  { id: 2, name: 'Cashmere Crewneck', category: 'men' },
  { id: 3, name: 'Linen Summer Shirt', category: 'men' },
  { id: 4, name: 'Tailored Wool Blazer', category: 'men' },
  { id: 5, name: 'Cotton Chino Pants', category: 'men' },
  { id: 6, name: 'Silk Wrap Dress', category: 'women' },
  { id: 7, name: 'Denim Skirt', category: 'women' },
  { id: 8, name: 'Knit Cardigan', category: 'women' },
  { id: 9, name: 'Pleated Midi Skirt', category: 'women' },
  { id: 10, name: 'Cropped Puffer Vest', category: 'women' },
  { id: 11, name: 'Leather Crossbody Bag', category: 'accessories' },
  { id: 12, name: 'Aviator Sunglasses', category: 'accessories' },
  { id: 13, name: 'Silk Scarf', category: 'accessories' },
  { id: 14, name: 'Wool Beanie', category: 'accessories' },
  { id: 15, name: 'Canvas Tote Bag', category: 'accessories' },
];

const colors = {
  men: '#dbeafe',
  women: '#fce7f3',
  accessories: '#fef3c7',
};

const outDir = path.join(__dirname, '..', 'app', 'client', 'public', 'img', 'products');
fs.mkdirSync(outDir, { recursive: true });

for (const p of products) {
  const bg = colors[p.category];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bg}"/>
  <text x="200" y="200" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle" fill="#374151">${p.name}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `${p.id}.svg`), svg);
}

console.log(`Generated ${products.length} SVGs in ${outDir}`);
