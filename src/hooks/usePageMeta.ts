import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const DEFAULT_DESCRIPTION =
  'The #1 video DJ pool since 2007. Download 26,000+ HD & 4K music videos — hip-hop, R&B, EDM, Latin & more. Built for professional video DJs.';

const SITE_NAME = 'The Video Pool';

/**
 * Sets page title, meta description, canonical, and OG tags dynamically.
 * Call at the top of each page component.
 */
export function usePageMeta({ title, description, canonical, ogImage, noIndex }: PageMeta) {
  useEffect(() => {
    // Title
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Helper to upsert a meta tag
    function setMeta(selector: string, content: string) {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        const attr = selector.match(/\[([^=]+)=/)?.[1];
        const val = selector.match(/="([^"]+)"/)?.[1];
        if (attr && val) el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    function setLink(rel: string, href: string) {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    }

    const desc = description ?? DEFAULT_DESCRIPTION;
    const canonicalUrl = canonical ?? window.location.origin + window.location.pathname;
    const image = ogImage ?? 'https://thevideopool.com/og-image.jpg';

    setMeta('meta[name="description"]', desc);
    setMeta('meta[name="robots"]', noIndex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', canonicalUrl);

    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:image"]', image);

    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', desc);
    setMeta('meta[name="twitter:image"]', image);

    return () => {
      // Restore defaults on unmount
      document.title = 'The Video Pool | 26,000+ HD Music Videos for DJs — Since 2007';
    };
  }, [title, description, canonical, ogImage, noIndex]);
}
