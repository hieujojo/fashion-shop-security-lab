import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

interface Product {
  id: number;
  name: string;
  price_cents: number;
  category: string;
  image_url: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const [q, setQ] = useState('');

  useEffect(() => {
    const url = new URL('/api/products', window.location.origin);
    if (category !== 'all') url.searchParams.set('category', category);
    if (q) url.searchParams.set('q', q);
    fetch(url.pathname + url.search)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, [category, q]);

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Accessories', value: 'accessories' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-48 flex-shrink-0">
          <h3 className="text-sm font-semibold mb-3">Categories</h3>
          <div className="flex md:flex-col gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setSearchParams(f.value === 'all' ? {} : { category: f.value })}
                className={`text-sm text-left px-3 py-2 rounded ${
                  category === f.value ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold capitalize">{category === 'all' ? 'All Products' : category}</h1>
            <input
              type="text"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-48"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
