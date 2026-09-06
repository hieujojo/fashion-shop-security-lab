import { useState } from 'react';
import { api } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const user = await api<{ id: number; email: string; role: string }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Demo accounts: admin@fashionhub.dev / admin123
      </p>
    </div>
  );
}
