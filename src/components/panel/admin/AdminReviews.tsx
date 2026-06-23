'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Review {
  id: string;
  studentName: string;
  reviewText: string;
  rating: number;
  course: string;
  placement: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentName: '',
    reviewText: '',
    rating: 5,
    course: '',
    placement: '',
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      } else {
        setReviews([]);
      }
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAdd = async () => {
    if (!form.studentName.trim() || !form.reviewText.trim() || !form.course.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add review');
      toast.success('Review added successfully');
      setForm({ studentName: '', reviewText: '', rating: 5, course: '', placement: '' });
      setShowForm(false);
      fetchReviews();
    } catch {
      toast.error('Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      toast.success('Review deleted successfully');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-[#c8882a] text-[#c8882a]' : 'text-zinc-600'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviews</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage student reviews and testimonials</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#7b1a10] to-[#9b2a18] hover:from-[#8b2a18] hover:to-[#ab3a28] text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">New Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Student Name *</Label>
              <Input
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="Enter student name"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#9b2a18]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Course *</Label>
              <Input
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                placeholder="Enter course name"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#9b2a18]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Placement</Label>
              <Input
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value })}
                placeholder="Enter placement details"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#9b2a18]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, rating: i + 1 })}
                    className="p-0.5 transition-colors"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i < form.rating
                          ? 'fill-[#c8882a] text-[#c8882a]'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-zinc-400 text-sm ml-2">{form.rating}/5</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Review Text *</Label>
            <Textarea
              value={form.reviewText}
              onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
              placeholder="Enter review text"
              rows={3}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#9b2a18]"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAdd}
              disabled={submitting}
              className="bg-gradient-to-r from-[#7b1a10] to-[#9b2a18] hover:from-[#8b2a18] hover:to-[#ab3a28] text-white border-0"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {submitting ? 'Adding...' : 'Add Review'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
          <Star className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-lg">No reviews yet</p>
          <p className="text-zinc-500 text-sm mt-1">Add your first review to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold text-white">{review.studentName}</h4>
                    {review.placement && (
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                        {review.placement}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">{review.course}</span>
                    <span className="text-zinc-700">·</span>
                    <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
                    {review.reviewText}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(review.id)}
                  className="text-zinc-500 hover:text-red-400 hover:bg-zinc-800 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
