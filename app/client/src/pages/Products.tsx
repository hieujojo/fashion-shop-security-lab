import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

interface Product {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  image_url: string;
}

const categories = ['all', 'men', 'women', 'accessories'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (q) params.set('q', q);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(setProducts)
      .catch(() => setError('Something went wrong'));
  }, [category, q]);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded capitalize ${
              category === c ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
