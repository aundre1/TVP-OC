// ============================================
// THE VIDEO POOL - BLOG INDEX PAGE
// SEO-optimized content hub for DJ video education
// ============================================

import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BLOG_POSTS } from '@/data/blogPosts';
import { Clock, Tag } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Guides: 'bg-cyan-500/20 text-cyan-400',
  Tutorials: 'bg-purple-500/20 text-purple-400',
  'Getting Started': 'bg-green-500/20 text-green-400',
  News: 'bg-yellow-500/20 text-yellow-400',
};

export default function BlogPage() {
  usePageMeta({
    title: 'DJ Video Resources & Guides | The Video Pool Blog',
    description:
      'Professional guides for video DJs — how to use music videos with Serato Video, rekordbox, VirtualDJ, where to find HD & 4K videos, and tips for building your video DJ library.',
    canonical: 'https://thevideopool.com/blog',
  });

  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary, #0a0a0f)', color: 'var(--text-primary, #e8e8ed)' }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 max-w-6xl mx-auto">
        <Link to="/welcome" className="text-xl font-bold text-cyan-400">
          The Video Pool
        </Link>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <Link to="/welcome" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/blog" className="text-white font-medium">
            Blog
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">DJ Video Resources</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Guides, tutorials, and resources for professional video DJs. How to build your library,
            set up your software, and get the most from every set.
          </p>
        </div>

        {/* Featured Post */}
        {featured && (
          <Link
            to={`/blog/${featured.slug}`}
            className="block mb-12 group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-cyan-500/50 transition-all"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    CATEGORY_COLORS[featured.category] ?? 'bg-white/10 text-white/60'
                  }`}
                >
                  {featured.category}
                </span>
                <span className="text-white/40 text-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readingTimeMin} min read
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">
                {featured.title}
              </h2>
              <p className="text-white/60 leading-relaxed mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {featured.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-white/40">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-500/50 transition-all flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-white/60'
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTimeMin} min
                </span>
              </div>
              <h3 className="font-semibold text-base mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                {post.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed flex-1">{post.excerpt}</p>
              <div className="mt-4 text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Read more →
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Build Your Video Library?</h2>
          <p className="text-white/60 mb-6 max-w-lg mx-auto">
            26,000+ HD & 4K music videos. New releases daily. Works with Serato, rekordbox, VirtualDJ, and
            MixEmergency.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors"
          >
            Start Free Trial — No Credit Card
          </Link>
        </div>
      </div>
    </div>
  );
}
