import { useEffect, useState } from 'react';
import { Newspaper, Plus, Trash2, CheckCircle2, X, Calendar, User, Eye } from 'lucide-react';
import api from '../../services/api';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Air Shipping');

  useEffect(() => {
    api.get('/blog?preview=true').then((response) => {
      setPosts((response.data?.data || []).map((post: any) => ({ id: post._id, title: post.title, category: post.categories?.[0] || 'General', author: post.author?.name || 'Admin Team', date: post.publishedAt || post.createdAt, status: post.published ? 'Published' : 'Draft' })));
    }).catch(() => triggerToast('Failed to load articles.'));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    api.post('/blog', { title, categories: [category], published: true, publishedAt: new Date().toISOString(), content: title }).then((response) => {
      const post = response.data?.data;
      if (post) setPosts((current) => [{ id: post._id, title: post.title, category, author: 'Admin Team', date: post.publishedAt, status: 'Published' }, ...current]);
      setShowModal(false); setTitle(''); triggerToast('Blog article published!');
    }).catch(() => triggerToast('Failed to publish article.'));
  };

  const handleDelete = (id: string) => {
    api.delete(`/blog/${id}`).then(() => { setPosts((current) => current.filter((post) => post.id !== id)); triggerToast('Article deleted.'); }).catch(() => triggerToast('Failed to delete article.'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <Newspaper className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Blog & News Publishing</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage trade articles, shipping advice, and company news updates</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Article Title</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Author</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{post.title}</td>
                <td className="px-6 py-4 font-semibold text-[#0B63CE]">{post.category}</td>
                <td className="px-6 py-4 text-slate-600">{post.author}</td>
                <td className="px-6 py-4 text-slate-500">{post.date}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New Article</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title of news post"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                >
                  <option value="Air Shipping">Air Shipping</option>
                  <option value="Sea Cargo">Sea Cargo</option>
                  <option value="Customs Rules">Customs Rules</option>
                </select>
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
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
