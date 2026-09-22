import { useEffect, useState } from 'react';
import {
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  UserCheck,
  Check,
  EyeOff
} from 'lucide-react';
import api from '../../services/api';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  comment: string;
  rating: number;
  status: 'Published' | 'Pending';
}

export default function AdminTestimonialsPage() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    api.get('/testimonials?preview=true').then((response) => {
      setReviews((response.data?.data || []).map((review: any) => ({ id: review._id, name: review.name, role: review.role || review.company || '', location: review.location || '', comment: review.text, rating: review.rating || 5, status: review.published ? 'Published' : 'Pending' })));
    }).catch(() => setReviews([]));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    api.post('/testimonials', { name, role: role || 'Verified Customer', location: location || 'Ghana', text: comment, rating, published: true }).then((response) => {
      const review = response.data?.data;
      if (review) setReviews((current) => [{ id: review._id, name: review.name, role: review.role, location: review.location, comment: review.text, rating: review.rating, status: 'Published' }, ...current]);
      setShowModal(false); setName(''); setRole(''); setLocation(''); setComment(''); triggerToast('New testimonial published.');
    }).catch(() => triggerToast('Failed to save testimonial.'));
  };

  const togglePublish = (id: string) => {
    const review = reviews.find((item) => item.id === id);
    if (!review) return;
    const published = review.status !== 'Published';
    api.put(`/testimonials/${id}`, { published }).then(() => { setReviews((current) => current.map((item) => item.id === id ? { ...item, status: published ? 'Published' : 'Pending' } : item)); triggerToast('Testimonial status updated.'); }).catch(() => triggerToast('Failed to update testimonial.'));
  };

  const handleDelete = (id: string) => {
    api.delete(`/testimonials/${id}`).then(() => { setReviews((current) => current.filter((review) => review.id !== id)); triggerToast('Testimonial removed.'); }).catch(() => triggerToast('Failed to remove testimonial.'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <Star className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Testimonials & Reviews</h1>
            <p className="text-xs text-slate-500 mt-0.5">Moderate customer feedback and publish verified reviews on the homepage</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    rev.status === 'Published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rev.status}
                </span>
              </div>

              <p className="text-xs text-slate-700 italic leading-relaxed">"{rev.comment}"</p>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-900 text-xs">{rev.name}</h4>
                <p className="text-[11px] text-slate-500">{rev.role} • {rev.location}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => togglePublish(rev.id)}
                className="text-xs font-bold text-[#0B63CE] hover:text-[#063B66] flex items-center gap-1"
              >
                {rev.status === 'Published' ? <EyeOff className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                <span>{rev.status === 'Published' ? 'Unpublish' : 'Approve'}</span>
              </button>
              <button
                onClick={() => handleDelete(rev.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Customer Testimonial</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Business</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Importer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Accra, Ghana"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Feedback *</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type customer testimonial review..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
