import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              FashionHub
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/products" className="text-gray-700 hover:text-black transition">Shop</Link>
              <Link to="/products?category=men" className="text-gray-700 hover:text-black transition">Men</Link>
              <Link to="/products?category=women" className="text-gray-700 hover:text-black transition">Women</Link>
              <Link to="/products?category=accessories" className="text-gray-700 hover:text-black transition">Accessories</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/products" className="text-sm text-gray-700 hover:text-black transition">Search</Link>
            <Link to="/profile" className="text-sm text-gray-700 hover:text-black transition">Account</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
