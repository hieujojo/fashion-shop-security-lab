import { useState } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  role: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: 'Shop', to: '/products' },
    { label: 'Men', to: '/products?category=men' },
    { label: 'Women', to: '/products?category=women' },
    { label: 'Accessories', to: '/products?category=accessories' },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              FashionHub
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              {links.map((l) => (
                <Link key={l.label} to={l.to} className="text-gray-700 hover:text-black transition">
                  {l.label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-black transition">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="hidden sm:inline text-sm text-gray-700 hover:text-black transition">
                  {user.email}
                </Link>
                <button
                  onClick={onLogout}
                  className="text-sm text-gray-700 hover:text-black transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm text-gray-700 hover:text-black transition">
                Sign in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-black"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              {l.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              Admin
            </Link>
          )}
          {user && (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              Account
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
