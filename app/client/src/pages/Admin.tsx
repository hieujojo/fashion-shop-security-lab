import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

type Tab = 'users' | 'products' | 'reviews';

interface User { id: number; email: string; role: string; created_at: string }
interface Product { id: number; name: string; category: string; price_cents: number; review_count: number }
interface Review { id: number; product_name: string; author: string; content: string; rating: number; created_at: string }

export default function Admin() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urls: Record<Tab, string> = {
      users: '/api/admin/users',
      products: '/api/admin/products',
      reviews: '/api/admin/reviews',
    };
    const setters = {
      users: setUsers,
      products: setProducts,
      reviews: setReviews,
    } as const;

    setLoading(true);
    setError('');
    setForbidden(false);
    api<unknown[]>(urls[tab])
      .then((data) => (setters[tab] as (v: unknown[]) => void)(data))
      .catch((err: Error) => {
        if (err.message.includes('403') || err.message.toLowerCase().includes('forbidden')) {
          setForbidden(true);
        } else {
          setError(`Failed to load ${tab}`);
        }
      })
      .finally(() => setLoading(false));
  }, [tab]);

  if (forbidden) {
    return (
      <div className="max-w-6xl mx-auto mt-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">403 — Admins only</h1>
        <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
        <Link to="/" className="text-sm underline text-gray-700 hover:text-black">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="flex gap-2 mb-6">
        {(['users', 'products', 'reviews'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded capitalize ${
              tab === t ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-500 mb-4">Loading…</p>}

      {tab === 'users' && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Role</th>
              <th className="border px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-4 py-2">{u.id}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">{u.role}</td>
                <td className="border px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'products' && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Category</th>
              <th className="border px-4 py-2 text-left">Price</th>
              <th className="border px-4 py-2 text-left">Reviews</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border px-4 py-2">{p.id}</td>
                <td className="border px-4 py-2">{p.name}</td>
                <td className="border px-4 py-2 capitalize">{p.category}</td>
                <td className="border px-4 py-2">${(p.price_cents / 100).toFixed(2)}</td>
                <td className="border px-4 py-2">{p.review_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{r.author}</span>
                <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                <span className="text-sm text-gray-400">on {r.product_name}</span>
              </div>
              <div
                className="review-content text-gray-800"
                dangerouslySetInnerHTML={{ __html: r.content }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
