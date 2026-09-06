import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { api } from './api';

interface User {
  id: number;
  email: string;
  role: string;
}

function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function handleLogout() {
    await api('/api/logout', { method: 'POST' });
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">FashionHub</Link>
        <div className="flex gap-4 text-sm items-center">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/products" className="hover:underline">Products</Link>
          {user ? (
            <>
              <Link to="/profile" className="hover:underline">Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:underline">Admin</Link>
              )}
              <span className="text-gray-500">{user.email}</span>
              <button onClick={handleLogout} className="hover:underline">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
