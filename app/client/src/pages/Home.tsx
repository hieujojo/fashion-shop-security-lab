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

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  const featured = products.slice(0, 8);

  return (
    <div>
      <div className="bg-gray-50 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">FashionHub</h1>
        <p className="text-gray-600 mb-6">Discover the latest trends in fashion</p>
        <Link to="/products" className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
          Shop Now
        </Link>
      </div>
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
