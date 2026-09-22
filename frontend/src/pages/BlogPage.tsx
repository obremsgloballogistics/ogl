import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import api from '../services/api';
import SectionHeading from '../components/SectionHeading';
import { localImages, localizeImage } from '../utils/localImages';

const DEFAULT_POSTS = [
  {
    _id: 'post-1',
    title: 'Preparing Your Cargo for International Air & Sea Transport',
    excerpt: 'Learn essential packing tips, labelling rules, and documentation steps to ensure seamless clearance for UK & China shipments to Ghana.',
    categories: ['Shipping Guide'],
    featuredImage: localImages.freightWarehouse,
    publishedAt: '2026-08-01',
    author: 'OBREMS Logistics Team',
  },
  {
    _id: 'post-2',
    title: 'Why Door-to-Door Freight Delivery is Ideal for Ghana Importers',
    excerpt: 'Explore how door-to-door delivery eliminates demurrage fees, reduces port hassle, and guarantees safe final-mile delivery directly to your doorstep.',
    categories: ['Logistics Insights'],
    featuredImage: localImages.heroMain,
    publishedAt: '2026-07-24',
    author: 'Operations Desk',
  },
  {
    _id: 'post-3',
    title: 'Understanding Ghana Customs Clearance & ICUMS Regulations',
    excerpt: 'A comprehensive guide on import duties, taxes, HS codes, and required permits when clearing cargo at Tema Port and Kotoka International Airport.',
    categories: ['Customs Clearance'],
    featuredImage: localImages.blogCargo,
    publishedAt: '2026-07-10',
    author: 'Customs Desk',
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>(DEFAULT_POSTS);

  useEffect(() => {
    api
      .get('/blog')
      .then((response) => {
        if (response.data?.data && response.data.data.length > 0) {
          setPosts(response.data.data);
        }
      })
      .catch(() => {
        setPosts(DEFAULT_POSTS);
      });
  }, []);

  return (
    <main className="bg-[#F4F7FA] min-h-screen py-12 text-[#172B3A]">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <SectionHeading
          label="LOGISTICS NEWS & INSIGHTS"
          title="Latest Freight Updates & Guides"
          description="Stay informed with expert shipping advice, Ghana import guides, and international freight forwarding updates."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post._id || post.title}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden relative border-b border-slate-100">
                  <img
                    src={localizeImage(post.featuredImage, localImages.blogDelivery)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-[#063B66] text-white text-xs font-bold rounded-md shadow-sm">
                    {post.categories?.[0] || 'Logistics'}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#0B63CE]" />
                      <span>{new Date(post.publishedAt || Date.now()).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#0B63CE]" />
                      <span>{post.author || 'OBREMS Team'}</span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#063B66] line-clamp-2 hover:text-[#0B63CE] cursor-pointer">
                    {post.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => alert(`Reading article: ${post.title}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B63CE] hover:text-[#063B66] uppercase tracking-wider"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

