import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price_cents: number;
  category: string;
  image_url: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const price = (product.price_cents / 100).toFixed(2);
  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-gray-100 aspect-[3/4] overflow-hidden mb-3">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1';
              img.src = '/img/placeholder.svg';
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div>
        <h3 className="font-medium text-sm mb-1 group-hover:underline">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-1 capitalize">{product.category}</p>
        <p className="text-sm font-semibold">${price}</p>
      </div>
    </Link>
  );
}
