import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

interface Product {
  id: number;
  name: string;
  price_cents: number;
  category: string;
  image_url: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const featured = products.slice(0, 8);

  return (
    <div>
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            New Season Arrivals
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Discover the latest trends in fashion. Quality materials, timeless designs.
          </p>
          <Link
            to="/products"
            className="inline-block bg-black text-white px-8 py-3 rounded text-sm font-medium hover:bg-gray-800 transition"
          >
            Shop all products
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
            <p className="text-gray-600 mb-4">We couldn't load products right now.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm underline text-gray-700 hover:text-black"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && featured.length === 0 && (
          <p className="text-gray-500 py-8 text-center">No products available yet.</p>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
