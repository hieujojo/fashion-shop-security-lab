import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewList from '../components/ReviewList';

interface Product {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  image_url: string;
}

interface Review {
  id: number;
  author: string;
  content: string;
  rating: number;
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus('loading');

    async function load() {
      try {
        const [pRes, rRes] = await Promise.allSettled([
          fetch(`/api/products/${id}`),
          fetch(`/api/products/${id}/reviews`),
        ]);

        if (cancelled) return;

        if (pRes.status === 'fulfilled') {
          if (pRes.value.status === 404) {
            setStatus('not-found');
            return;
          }
          if (!pRes.value.ok) {
            setStatus('error');
            return;
          }
          setProduct(await pRes.value.json());
        } else {
          setStatus('error');
          return;
        }

        if (rRes.status === 'fulfilled' && rRes.value.ok) {
          setReviews(await rRes.value.json());
        }
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, rating: Number(rating), content }),
      });
      if (!res.ok) throw new Error('Failed');
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setAuthor('');
      setContent('');
    } catch {
      alert('Failed to post review');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-gray-500">Loading…</div>;
  }

  if (status === 'not-found') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-gray-600 mb-6">This product doesn't exist or has been removed.</p>
        <Link to="/products" className="text-sm underline text-gray-700 hover:text-black">
          ← Back to products
        </Link>
      </div>
    );
  }

  if (status === 'error' || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">We couldn't load this product. Please try again later.</p>
        <Link to="/products" className="text-sm underline text-gray-700 hover:text-black">
          ← Back to products
        </Link>
      </div>
    );
  }

  const price = (product.price_cents / 100).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="text-sm text-gray-500 hover:underline mb-4 inline-block">
        ← Back to products
      </Link>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-100 aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = '/img/placeholder.svg';
              }
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm text-gray-500 capitalize mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold mb-6">${price}</p>
          <p className="text-gray-700 mb-6">{product.description}</p>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <form onSubmit={handleSubmit} className="border rounded p-6 mb-8 space-y-4">
          <h3 className="font-medium">Write a review</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
              required
            />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Your review"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm h-24"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post review'}
          </button>
        </form>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
