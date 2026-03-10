// ============================================
// THE VIDEO POOL - INDIVIDUAL BLOG POST PAGE
// Renders posts from blogPosts.ts with full SEO schema
// ============================================

import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getBlogPost, BLOG_POSTS } from '@/data/blogPosts';
import { Clock, Tag, ArrowLeft, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Guides: 'bg-cyan-500/20 text-cyan-400',
  Tutorials: 'bg-purple-500/20 text-purple-400',
  'Getting Started': 'bg-green-500/20 text-green-400',
  News: 'bg-yellow-500/20 text-yellow-400',
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  usePageMeta(
    post
      ? {
          title: post.metaTitle,
          description: post.metaDescription,
          canonical: `https://thevideopool.com/blog/${post.slug}`,
        }
      : {
          title: 'Post Not Found | The Video Pool Blog',
          description: 'This blog post could not be found.',
          noIndex: true,
        }
  );

  // Inject Article + FAQ JSON-LD when post loads
  useEffect(() => {
    if (!post) return;

    const existing = document.getElementById('blog-post-schema');
    if (existing) existing.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.publishDate,
      dateModified: post.updatedDate ?? post.publishDate,
      author: {
        '@type': 'Organization',
        name: post.author.name,
        url: 'https://thevideopool.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'The Video Pool',
        logo: {
          '@type': 'ImageObject',
          url: 'https://thevideopool.com/favicon.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://thevideopool.com/blog/${post.slug}`,
      },
    };

    const script = document.createElement('script');
    script.id = 'blog-post-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('blog-post-schema');
      if (el) el.remove();
    };
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
  ).slice(0, 3);

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
          <Link to="/blog" className="hover:text-white transition-colors">
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

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link to="/blog" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white/60 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Post Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-white/60'
              }`}
            >
              {post.category}
            </span>
            <span className="text-white/40 text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTimeMin} min read
            </span>
            <span className="text-white/40 text-sm">
              {new Date(post.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-white/60 text-lg leading-relaxed">{post.excerpt}</p>
          <div className="flex items-center gap-2 flex-wrap mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Post Content */}
        <article
          className="prose prose-invert prose-cyan max-w-none
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-white
            prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-white/90
            prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-white/70 prose-li:leading-relaxed
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4 prose-pre:text-sm
            prose-table:text-sm prose-th:text-white/80 prose-th:font-semibold prose-td:text-white/60
            prose-thead:border-white/20 prose-tbody:border-white/10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Inline */}
        <div className="my-12 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Try The Video Pool Free</h2>
          <p className="text-white/60 mb-5 text-sm">
            26,000+ HD & 4K music videos. Compatible with Serato, rekordbox, VirtualDJ & MixEmergency.
            New releases daily.
          </p>
          <Link
            to="/register"
            className="inline-block px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors"
          >
            Start Free Trial — No Credit Card
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:border-cyan-500/50 transition-all"
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                      CATEGORY_COLORS[related.category] ?? 'bg-white/10 text-white/60'
                    }`}
                  >
                    {related.category}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-cyan-400 transition-colors">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
