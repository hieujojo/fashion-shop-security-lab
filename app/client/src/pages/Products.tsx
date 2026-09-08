import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const q = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(q);

  // Keep the input in sync if the URL changes (e.g. back/forward navigation)
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // Debounce the search input into the URL query string
  useEffect(() => {
    const t = setTimeout(() => {
      if (inputValue !== q) {
        const next = new URLSearchParams(searchParams);
        if (inputValue) next.set('q', inputValue);
        else next.delete('q');
        setSearchParams(next, { replace: true });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue, q, searchParams, setSearchParams]);

  // Fetch products whenever category or query changes; abort stale requests
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    const url = new URL('/api/products', window.location.origin);
    if (category !== 'all') url.searchParams.set('category', category);
    if (q) url.searchParams.set('q', q);

    fetch(url.pathname + url.search, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [category, q]);

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Accessories', value: 'accessories' },
  ];

  function selectCategory(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('category');
    else next.set('category', value);
    setSearchParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-48 flex-shrink-0">
          <h3 className="text-sm font-semibold mb-3">Categories</h3>
          <div className="flex md:flex-col gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => selectCategory(f.value)}
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold capitalize">
              {category === 'all' ? 'All Products' : category}
            </h1>
            <input
              type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full sm:w-64"
              aria-label="Search products"
            />
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] mb-3 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">Something went wrong while loading products.</p>
              <button
                onClick={() => setSearchParams(searchParams, { replace: true })}
                className="text-sm underline text-gray-700 hover:text-black"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-2">No products found.</p>
              {q && (
                <p className="text-sm text-gray-500">
                  No results for “{q}”. Try a different search term.
                </p>
              )}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
