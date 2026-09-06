import { useState, useEffect } from 'react';
import { api } from '../api';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<User>('/api/profile')
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const updated = await api<User>('/api/profile/email', {
        method: 'POST',
        body: JSON.stringify({ newEmail }),
      });
      setUser(updated);
      setNewEmail('');
      setMessage('Email updated successfully');
    } catch {
      setMessage('Failed to update email');
    }
  }

  if (!user) return <div className="max-w-6xl mx-auto mt-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="border rounded p-6 mb-8">
        <p className="mb-2"><span className="font-medium">ID:</span> {user.id}</p>
        <p className="mb-2"><span className="font-medium">Email:</span> {user.email}</p>
        <p className="mb-2"><span className="font-medium">Role:</span> {user.role}</p>
      </div>

      <div className="border rounded p-6">
        <h2 className="text-xl font-bold mb-4">Change email</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Save
          </button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </form>
      </div>
    </div>
  );
}
