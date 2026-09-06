interface Review {
  id: number;
  author: string;
  content: string;
  rating: number;
  created_at: string;
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return <p className="text-gray-500">No reviews yet.</p>;

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="border rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">{r.author}</span>
            <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            <span className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          <div
            className="review-content text-gray-800"
            dangerouslySetInnerHTML={{ __html: r.content }}
          />
        </div>
      ))}
    </div>
  );
}
