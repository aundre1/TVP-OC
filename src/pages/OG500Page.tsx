// ============================================
// THE VIDEO POOL - OG 500 LANDING PAGE
// Standalone landing page for the OG 500 win-back campaign
// 30% off for life, first 500 subscribers
// ============================================

import { useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function OG500Page() {
  usePageMeta({
    title: 'OG 500 — 30% Off For Life | The Video Pool is Back',
    description: 'The Video Pool returns! 26,000+ HD music videos across every genre. OG 500 offer: 30% off your membership forever, for the first 500 founding members.',
    canonical: 'https://thevideopool.com/og500',
  });

  useEffect(() => {

    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Counter animation
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-counter') || '0');
      let current = 0;
      const increment = target / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current).toLocaleString();
      }, 16);
    });

    // FAQ accordion
    const handleFaqClick = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const answer = target.nextElementSibling as HTMLElement;
      const icon = target.querySelector('.faq-icon');
      if (answer && icon) {
        const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
        answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
        answer.style.opacity = isOpen ? '0' : '1';
        icon.textContent = isOpen ? '+' : '−';
      }
    };

    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach((q) => q.addEventListener('click', handleFaqClick));

    return () => {
      faqQuestions.forEach((q) => q.removeEventListener('click', handleFaqClick));
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: '#0a0a0a',
        color: '#ffffff',
        lineHeight: 1.6,
        WebkitFontSmoothing: 'antialiased',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .og500-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .og500-page { --bg-primary: #0a0a0a; --bg-card: #111; --border: #222; --accent: #00d4ff; --text-primary: #ffffff; --text-secondary: #a0a0a0; --gradient: linear-gradient(135deg, #00d4ff 0%, #0088ff 100%); }
        .og500-page a { color: var(--accent); text-decoration: none; }
        .og500-page a:hover { text-decoration: underline; }
        
        .og-hero { text-align: center; padding: 80px 20px 60px; position: relative; overflow: hidden; }
        .og-hero::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 60%); pointer-events: none; }
        
        .og-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); border-radius: 100px; padding: 8px 20px; font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 24px; letter-spacing: 0.5px; text-transform: uppercase; }
        .og-badge .pulse { width: 8px; height: 8px; border-radius: 50%; background: #00ff88; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        
        .og-hero h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px; position: relative; }
        .og-hero h1 .gradient-text { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        
        .og-hero .subtitle { font-size: clamp(1rem, 2vw, 1.25rem); color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px; }
        
        .og-stats { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin-bottom: 40px; }
        .og-stat { text-align: center; }
        .og-stat .number { font-size: 2rem; font-weight: 800; color: var(--accent); }
        .og-stat .label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
        
        .og-cta-group { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .og-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 40px; background: var(--gradient); color: #000; font-weight: 700; font-size: 16px; border-radius: 12px; border: none; cursor: pointer; transition: all 0.3s; text-decoration: none; }
        .og-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,212,255,0.3); text-decoration: none; color: #000; }
        .og-btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 40px; background: transparent; color: var(--text-primary); font-weight: 600; font-size: 16px; border-radius: 12px; border: 1px solid var(--border); cursor: pointer; transition: all 0.3s; text-decoration: none; }
        .og-btn-secondary:hover { border-color: var(--accent); text-decoration: none; }
        
        .og-section { padding: 60px 20px; max-width: 1100px; margin: 0 auto; }
        .og-section-title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; text-align: center; margin-bottom: 12px; }
        .og-section-subtitle { color: var(--text-secondary); text-align: center; max-width: 600px; margin: 0 auto 40px; font-size: 15px; }
        
        .og-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 900px; margin: 0 auto; }
        .og-price-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; position: relative; transition: all 0.3s; }
        .og-price-card:hover { border-color: rgba(0,212,255,0.3); transform: translateY(-4px); }
        .og-price-card.popular { border-color: var(--accent); }
        .og-price-card.popular::before { content: 'MOST POPULAR'; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--gradient); color: #000; font-size: 11px; font-weight: 700; padding: 4px 16px; border-radius: 100px; letter-spacing: 1px; }
        .og-price-card .plan-name { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .og-price-card .price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
        .og-price-card .original-price { font-size: 1.5rem; color: var(--text-secondary); text-decoration: line-through; }
        .og-price-card .og-price { font-size: 2.5rem; font-weight: 800; color: var(--accent); }
        .og-price-card .period { color: var(--text-secondary); font-size: 14px; }
        .og-price-card .savings { color: #00ff88; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .og-price-card .features { list-style: none; margin-bottom: 24px; }
        .og-price-card .features li { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 14px; color: var(--text-secondary); }
        .og-price-card .features li::before { content: '✓'; color: var(--accent); font-weight: 700; }
        .og-price-card .select-btn { width: 100%; padding: 14px; border-radius: 10px; border: none; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; }
        .og-price-card.popular .select-btn { background: var(--gradient); color: #000; }
        .og-price-card:not(.popular) .select-btn { background: rgba(255,255,255,0.05); color: var(--text-primary); border: 1px solid var(--border); }
        .og-price-card .select-btn:hover { transform: translateY(-1px); }
        
        .og-code-banner { text-align: center; padding: 40px 20px; margin: 0 20px; background: rgba(0,212,255,0.05); border: 1px dashed rgba(0,212,255,0.3); border-radius: 16px; max-width: 700px; margin: 40px auto; }
        .og-code-banner .code { font-size: 2rem; font-weight: 900; letter-spacing: 4px; color: var(--accent); margin: 8px 0; }
        .og-code-banner .instruction { color: var(--text-secondary); font-size: 14px; }
        
        .og-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .og-feature { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
        .og-feature .icon { font-size: 28px; margin-bottom: 12px; }
        .og-feature h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .og-feature p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        
        .faq-list { max-width: 700px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-question { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; cursor: pointer; font-weight: 600; font-size: 15px; width: 100%; background: none; border: none; color: var(--text-primary); text-align: left; }
        .faq-question:hover { color: var(--accent); }
        .faq-icon { font-size: 20px; color: var(--accent); flex-shrink: 0; margin-left: 16px; }
        .faq-answer { max-height: 0; overflow: hidden; opacity: 0; transition: all 0.3s; padding: 0 0 0 0; }
        .faq-answer p { color: var(--text-secondary); font-size: 14px; line-height: 1.8; padding-bottom: 20px; }
        
        .og-footer { text-align: center; padding: 60px 20px; border-top: 1px solid var(--border); }
        .og-footer h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 800; margin-bottom: 16px; }
        .og-footer p { color: var(--text-secondary); margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto; margin-bottom: 30px; }
        .og-footer .fine-print { margin-top: 40px; font-size: 12px; color: #555; }
        
        @media (max-width: 640px) {
          .og-hero { padding: 60px 16px 40px; }
          .og-stats { gap: 24px; }
          .og-cta-group { flex-direction: column; align-items: center; }
          .og-btn-primary, .og-btn-secondary { width: 100%; max-width: 320px; justify-content: center; }
          .og-pricing { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="og500-page">
        {/* Hero */}
        <section className="og-hero">
          <div className="og-badge">
            <span className="pulse" />
            <span>Limited Offer — First 500 Only</span>
          </div>
          <h1>
            The Video Pool<br />
            <span className="gradient-text">Is Back.</span>
          </h1>
          <p className="subtitle">
            29,000+ HD music videos. Every genre. Unlimited downloads.
            And for our OG subscribers — <strong>30% off for life.</strong>
          </p>
          <div className="og-stats">
            <div className="og-stat">
              <div className="number" data-counter="29000">0</div>
              <div className="label">Music Videos</div>
            </div>
            <div className="og-stat">
              <div className="number" data-counter="500">0</div>
              <div className="label">OG Spots Left</div>
            </div>
            <div className="og-stat">
              <div className="number">30%</div>
              <div className="label">Off Forever</div>
            </div>
          </div>
          <div className="og-cta-group">
            <a href="#pricing" className="og-btn-primary">🔥 Claim Your OG Spot</a>
            <a href="#features" className="og-btn-secondary">See What's New →</a>
          </div>
        </section>

        {/* Promo Code Banner */}
        <div className="og-code-banner">
          <div className="instruction">Use promo code at checkout</div>
          <div className="code">OG500</div>
          <div className="instruction">30% off for life — only for the first 500 subscribers</div>
        </div>

        {/* Features */}
        <section className="og-section" id="features">
          <h2 className="og-section-title">Everything You Loved. Upgraded.</h2>
          <p className="og-section-subtitle">We rebuilt The Video Pool from the ground up. Here's what's new.</p>
          <div className="og-features-grid">
            <div className="og-feature">
              <div className="icon">🎬</div>
              <h3>29,000+ Videos</h3>
              <p>The largest DJ music video catalog anywhere. HD quality, every genre, updated weekly.</p>
            </div>
            <div className="og-feature">
              <div className="icon">⚡</div>
              <h3>Lightning Downloads</h3>
              <p>New CDN infrastructure. Downloads are 3x faster than before.</p>
            </div>
            <div className="og-feature">
              <div className="icon">🔍</div>
              <h3>AI-Powered Search</h3>
              <p>Find any video instantly. Search by song, artist, genre, BPM, or mood.</p>
            </div>
            <div className="og-feature">
              <div className="icon">📱</div>
              <h3>Completely Redesigned</h3>
              <p>Modern interface built for speed. Works beautifully on desktop and mobile.</p>
            </div>
            <div className="og-feature">
              <div className="icon">🎵</div>
              <h3>Curated Playlists</h3>
              <p>Pre-built sets for every occasion. Wedding, club, hip-hop, Latin, country — all ready to go.</p>
            </div>
            <div className="og-feature">
              <div className="icon">💾</div>
              <h3>Unlimited Downloads</h3>
              <p>No daily limits. Download as many videos as you need, whenever you need them.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="og-section" id="pricing">
          <h2 className="og-section-title">OG 500 Pricing</h2>
          <p className="og-section-subtitle">Lock in 30% off for life. Rate stays as long as your subscription is active.</p>
          <div className="og-pricing">
            <div className="og-price-card">
              <div className="plan-name">Monthly</div>
              <div className="price-row">
                <span className="original-price">$34.99</span>
                <span className="og-price">$24.49</span>
              </div>
              <div className="period">per month</div>
              <div className="savings">You save $10.50/month</div>
              <ul className="features">
                <li>Unlimited downloads</li>
                <li>Full catalog access</li>
                <li>New releases weekly</li>
                <li>Cancel anytime</li>
              </ul>
              <a href="https://thevideopool.com/membership?plan=monthly&promo=OG500" className="select-btn" style={{display:'block',textAlign:'center',textDecoration:'none'}}>Get Started</a>
            </div>
            <div className="og-price-card popular">
              <div className="plan-name">Quarterly</div>
              <div className="price-row">
                <span className="original-price">$99.99</span>
                <span className="og-price">$69.99</span>
              </div>
              <div className="period">every 3 months</div>
              <div className="savings">You save $30/quarter ($10/mo effective)</div>
              <ul className="features">
                <li>Everything in Monthly</li>
                <li>Extra 5% savings</li>
                <li>Priority support</li>
                <li>Cancel anytime</li>
              </ul>
              <a href="https://thevideopool.com/membership?plan=quarterly&promo=OG500" className="select-btn" style={{display:'block',textAlign:'center',textDecoration:'none'}}>Get Started</a>
            </div>
            <div className="og-price-card">
              <div className="plan-name">Annual</div>
              <div className="price-row">
                <span className="original-price">$299.99</span>
                <span className="og-price">$209.99</span>
              </div>
              <div className="period">per year</div>
              <div className="savings">You save $90/year ($17.50/mo effective)</div>
              <ul className="features">
                <li>Everything in Quarterly</li>
                <li>Best value — save 42%</li>
                <li>VIP support</li>
                <li>Early access to new features</li>
              </ul>
              <a href="https://thevideopool.com/membership?plan=annual&promo=OG500" className="select-btn" style={{display:'block',textAlign:'center',textDecoration:'none'}}>Get Started</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="og-section">
          <h2 className="og-section-title">Questions?</h2>
          <p className="og-section-subtitle">Everything you need to know about the OG 500 offer.</p>
          <div className="faq-list">
            <div className="faq-item">
              <button className="faq-question">
                What is the OG 500 offer?
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <p>The OG 500 is our exclusive comeback offer for our first 500 subscribers. You get 30% off your subscription price forever — as long as you keep your subscription active. Once 500 spots are claimed, this offer is gone.</p>
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-question">
                How long does the 30% discount last?
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <p>Forever. Literally. As long as your subscription remains active, you keep the 30% discount. If you cancel and resubscribe later, the discount will no longer be available.</p>
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-question">
                How do I use the promo code?
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <p>Enter code <strong>OG500</strong> at checkout. The 30% discount will be applied immediately to your first and all future payments.</p>
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-question">
                What kind of videos do you have?
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <p>Over 29,000 HD music videos across every genre — Hip-Hop, R&B, Pop, EDM, Latin, Country, Rock, Reggae, Classics, and more. New videos added weekly. Perfect for DJs, VJs, and venues.</p>
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-question">
                Can I cancel anytime?
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <p>Yes. Cancel anytime with no fees. But remember — if you cancel, you lose the OG 500 lifetime discount. You can resubscribe later, but at full price.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="og-footer">
          <h2>Don't Miss Out.</h2>
          <p>500 spots. 30% off forever. Once they're gone, they're gone.</p>
          <a href="#pricing" className="og-btn-primary">🔥 Claim Your OG Spot Now</a>
          <div className="fine-print">
            <p>© {new Date().getFullYear()} The Video Pool. All rights reserved.</p>
            <p style={{marginTop: 8}}>OG 500 offer limited to first 500 redemptions. Discount applies for the lifetime of continuous subscription. Promo code: OG500.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
