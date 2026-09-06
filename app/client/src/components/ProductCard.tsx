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
    <Link to={`/products/${product.id}`} className="border rounded overflow-hidden hover:shadow-lg transition">
      <div className="bg-gray-100 h-48 flex items-center justify-center">
        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        <p className="font-bold">${price}</p>
      </div>
    </Link>
  );
}
