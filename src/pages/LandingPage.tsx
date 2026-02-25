// ============================================
// THE VIDEO POOL - PUBLIC LANDING PAGE
// Premium, conversion-focused marketing page
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Download,
  Music,
  Zap,
  Shield,
  Star,
  ChevronRight,
  ChevronDown,
  Check,
  Monitor,
  Smartphone,
  Headphones,
  TrendingUp,
  Clock,
  Disc3,
  Video,
  Sparkles,
  Users,
  Globe,
  Award,
} from 'lucide-react';
import { clsx } from 'clsx';

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-tvp-bg-primary via-tvp-bg-secondary to-tvp-bg-primary" />

      {/* Animated glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tvp-accent-cyan/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tvp-accent-purple/10 rounded-full blur-[128px] animate-pulse delay-1000" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tvp-accent-cyan/10 border border-tvp-accent-cyan/20 mb-8">
          <Sparkles className="w-4 h-4 text-tvp-accent-cyan" />
          <span className="text-sm font-medium text-tvp-accent-cyan">
            The #1 DJ Video Pool
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="text-tvp-text-primary">Level Up Your</span>
          <br />
          <span className="bg-gradient-to-r from-tvp-accent-cyan via-tvp-accent-purple to-tvp-accent-cyan bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            DJ Sets
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-tvp-text-secondary max-w-3xl mx-auto mb-8">
          Access <span className="text-tvp-text-primary font-semibold">30,000+ HD music videos</span> with
          new releases daily. Built by DJs, for DJs who demand excellence.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-tvp-text-primary">30K+</div>
            <div className="text-sm text-tvp-text-muted">HD Videos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-tvp-text-primary">8+</div>
            <div className="text-sm text-tvp-text-muted">Genres</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-tvp-text-primary">Daily</div>
            <div className="text-sm text-tvp-text-muted">New Releases</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-tvp-text-primary">4K</div>
            <div className="text-sm text-tvp-text-muted">Quality Available</div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-tvp-accent-cyan text-black font-semibold rounded-xl hover:bg-tvp-accent-cyan-hover transition-all duration-200 shadow-lg shadow-tvp-accent-cyan/25 hover:shadow-xl hover:shadow-tvp-accent-cyan/30 hover:-translate-y-0.5"
          >
            Start Free Trial
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-tvp-bg-elevated text-tvp-text-primary font-semibold rounded-xl border border-tvp-border-default hover:border-tvp-accent-cyan/50 hover:bg-tvp-bg-tertiary transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* First month promo */}
        <p className="text-sm text-tvp-text-muted">
          <span className="text-tvp-accent-gold font-semibold">50% OFF</span> your first month on all plans
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-tvp-text-muted" />
      </div>
    </section>
  );
}

// ============================================
// VALUE PROPOSITIONS
// ============================================
function ValuePropsSection() {
  const props = [
    {
      icon: Video,
      title: 'Massive Video Library',
      description: '30,000+ professionally produced music videos across Hip-Hop, EDM, Latin, Pop, Country, R&B, Rock, and Throwbacks. New content added daily.',
      highlight: '30K+ Videos',
    },
    {
      icon: Sparkles,
      title: 'Premium Quality',
      description: 'Crystal-clear HD and 4K video quality. Multiple format options including clean edits, extended versions, and quick hits.',
      highlight: 'Up to 4K',
    },
    {
      icon: Zap,
      title: 'DJ-Built Tools',
      description: 'Smart Set Builder with BPM/Key matching, advanced search filters, and instant downloads. Built by DJs who understand your workflow.',
      highlight: 'Set Builder',
    },
  ];

  return (
    <section className="py-24 bg-tvp-bg-secondary">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tvp-text-primary mb-4">
            Everything You Need to Rock Any Venue
          </h2>
          <p className="text-lg text-tvp-text-secondary max-w-2xl mx-auto">
            From intimate lounges to massive festivals, we've got the videos that move crowds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {props.map((prop, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl bg-tvp-bg-primary border border-tvp-border-subtle hover:border-tvp-accent-cyan/30 transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-tvp-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-tvp-accent-cyan/10 text-tvp-accent-cyan mb-6 group-hover:scale-110 transition-transform">
                  <prop.icon className="w-7 h-7" />
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-tvp-accent-cyan/10 text-tvp-accent-cyan text-xs font-semibold mb-4">
                  {prop.highlight}
                </div>

                <h3 className="text-xl font-semibold text-tvp-text-primary mb-3">
                  {prop.title}
                </h3>

                <p className="text-tvp-text-secondary leading-relaxed">
                  {prop.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CONTENT PREVIEW (What's Hot)
// ============================================
function ContentPreviewSection() {
  const genres = [
    { name: 'Hip-Hop', count: '8,500+', color: 'from-orange-500 to-red-500' },
    { name: 'EDM', count: '6,200+', color: 'from-purple-500 to-pink-500' },
    { name: 'Latin', count: '5,800+', color: 'from-yellow-500 to-orange-500' },
    { name: 'Pop', count: '4,500+', color: 'from-cyan-500 to-blue-500' },
    { name: 'R&B', count: '3,200+', color: 'from-pink-500 to-purple-500' },
    { name: 'Country', count: '2,100+', color: 'from-amber-500 to-yellow-500' },
    { name: 'Rock', count: '1,800+', color: 'from-red-500 to-orange-500' },
    { name: 'Throwbacks', count: '3,500+', color: 'from-indigo-500 to-purple-500' },
  ];

  const hotTracks = [
    { title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', badge: 'HOT' },
    { title: 'APT.', artist: 'ROSÉ & Bruno Mars', badge: 'NEW' },
    { title: 'Espresso', artist: 'Sabrina Carpenter', badge: 'HOT' },
    { title: 'Birds of a Feather', artist: 'Billie Eilish', badge: 'NEW' },
    { title: 'Not Like Us', artist: 'Kendrick Lamar', badge: 'HOT' },
    { title: 'A Bar Song', artist: 'Shaboozey', badge: 'NEW' },
  ];

  return (
    <section className="py-24 bg-tvp-bg-primary">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tvp-text-primary mb-4">
            Explore Our Library
          </h2>
          <p className="text-lg text-tvp-text-secondary">
            From chart-toppers to underground hits, we've got every vibe covered.
          </p>
        </div>

        {/* Genre grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {genres.map((genre) => (
            <div
              key={genre.name}
              className="group relative overflow-hidden rounded-xl p-6 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan/30 cursor-pointer transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <h3 className="text-lg font-semibold text-tvp-text-primary mb-1">
                  {genre.name}
                </h3>
                <p className="text-sm text-tvp-text-muted">
                  {genre.count} videos
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hot this week */}
        <div className="bg-tvp-bg-secondary rounded-2xl border border-tvp-border-subtle p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-tvp-accent-coral" />
            <h3 className="text-xl font-semibold text-tvp-text-primary">
              Hot This Week
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotTracks.map((track, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-tvp-bg-primary border border-tvp-border-subtle hover:border-tvp-accent-cyan/30 transition-colors"
              >
                {/* Placeholder thumbnail */}
                <div className="w-16 h-10 rounded-lg bg-tvp-bg-elevated flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-tvp-text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-tvp-text-primary truncate">
                      {track.title}
                    </span>
                    <span className={clsx(
                      'px-1.5 py-0.5 text-[10px] font-bold rounded',
                      track.badge === 'HOT'
                        ? 'bg-gradient-to-r from-tvp-accent-coral to-tvp-status-warning text-white'
                        : 'bg-tvp-accent-cyan text-black'
                    )}>
                      {track.badge}
                    </span>
                  </div>
                  <span className="text-xs text-tvp-text-muted truncate block">
                    {track.artist}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover font-medium transition-colors"
            >
              Sign up to browse all videos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION
// ============================================
function PricingSection() {
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      price: '$0',
      interval: '',
      perMonth: '',
      downloads: '1',
      features: [
        '1 download per month',
        'Browse full catalog',
        'Set Builder access',
        'Up to 1080p quality',
      ],
      cta: 'Get Started',
      popular: false,
      trialEligible: false,
    },
    {
      name: 'Starter',
      slug: 'starter',
      price: '$35',
      interval: '/month',
      perMonth: '',
      downloads: '200',
      features: [
        '200 downloads per month',
        'Full HD & all versions',
        'All genres access',
        'Priority support',
      ],
      cta: 'Get Started',
      popular: false,
      trialEligible: false,
    },
    {
      name: 'Pro',
      slug: 'pro',
      price: '$100',
      interval: '/quarter',
      perMonth: '$33/mo',
      downloads: '250',
      features: [
        '250 downloads per month',
        'All quality versions',
        'Batch downloads',
        'Early access to new releases',
        'Set Builder Pro',
      ],
      cta: 'Start Free Trial',
      popular: true,
      trialEligible: true,
    },
    {
      name: 'Elite',
      slug: 'elite',
      price: '$360',
      interval: '/year',
      perMonth: '$30/mo',
      downloads: '300',
      features: [
        '300 downloads per month',
        'All quality versions',
        'Bulk downloads',
        'Early access + exclusive content',
        '24/7 priority support',
        'Song request priority',
      ],
      cta: 'Start Free Trial',
      popular: false,
      trialEligible: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-tvp-bg-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tvp-text-primary mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-tvp-text-secondary max-w-2xl mx-auto">
            Trusted by <span className="text-tvp-accent-cyan font-semibold">11,000+ DJs worldwide</span>.
            No contracts. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={clsx(
                'relative rounded-2xl p-6 transition-all duration-300',
                plan.popular
                  ? 'bg-gradient-to-b from-tvp-accent-cyan/10 to-tvp-bg-primary border-2 border-tvp-accent-cyan shadow-xl shadow-tvp-accent-cyan/10'
                  : 'bg-tvp-bg-primary border border-tvp-border-subtle hover:border-tvp-accent-cyan/30'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-tvp-accent-cyan text-black text-sm font-semibold rounded-full">
                  Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-tvp-text-primary mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-tvp-text-muted mb-3">{plan.downloads} downloads/month</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-tvp-text-primary">
                    {plan.price}
                  </span>
                  {plan.interval && (
                    <span className="text-tvp-text-muted">{plan.interval}</span>
                  )}
                </div>
                {plan.perMonth && (
                  <p className="text-sm text-tvp-text-muted mt-1">{plan.perMonth}</p>
                )}
              </div>

              <div className="mb-6">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tvp-accent-cyan flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-tvp-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className={clsx(
                  'block w-full py-3 rounded-xl font-semibold text-center transition-all duration-200',
                  plan.popular
                    ? 'bg-tvp-accent-cyan text-black hover:bg-tvp-accent-cyan-hover shadow-lg shadow-tvp-accent-cyan/25'
                    : 'bg-tvp-bg-elevated text-tvp-text-primary hover:bg-tvp-bg-tertiary border border-tvp-border-default hover:border-tvp-accent-cyan/50'
                )}
              >
                {plan.cta}
              </Link>
              {plan.trialEligible && (
                <p className="text-center text-xs text-tvp-text-muted mt-2">7-day free trial</p>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-tvp-text-muted mt-8">
          All plans include instant access. No approval process required.
        </p>
      </div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: Disc3,
      title: 'BPM & Key Matching',
      description: 'Our Set Builder analyzes BPM and musical key to help you create seamless mixes.',
    },
    {
      icon: Download,
      title: 'Instant Downloads',
      description: 'No waiting. Download your videos instantly in your preferred quality and format.',
    },
    {
      icon: Clock,
      title: 'Multiple Versions',
      description: 'Clean edits, explicit versions, intros, outros, and quick hits for every track.',
    },
    {
      icon: Monitor,
      title: 'Software Compatible',
      description: 'Works with Serato Video, VirtualDJ, rekordbox, and all major DJ software.',
    },
    {
      icon: Globe,
      title: 'Global Content',
      description: 'International hits from around the world - Latin, K-Pop, Afrobeats, and more.',
    },
    {
      icon: Headphones,
      title: 'High-Quality Audio',
      description: 'Premium 320kbps audio paired with stunning HD and 4K video quality.',
    },
  ];

  return (
    <section className="py-24 bg-tvp-bg-primary">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tvp-text-primary mb-4">
            Built for Professional DJs
          </h2>
          <p className="text-lg text-tvp-text-secondary max-w-2xl mx-auto">
            Every feature designed to streamline your workflow and elevate your performances.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex gap-4 p-6 rounded-xl bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan/30 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-tvp-accent-cyan/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-tvp-accent-cyan" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-tvp-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-tvp-text-secondary text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SOCIAL PROOF SECTION
// ============================================
function SocialProofSection() {
  // Placeholder testimonials - replace with real ones
  const testimonials = [
    {
      quote: "The Video Pool has completely transformed my sets. The quality is unmatched.",
      author: "DJ Mike",
      role: "Club DJ, Las Vegas",
      avatar: null,
    },
    {
      quote: "Finally, a video pool that understands what DJs actually need. The Set Builder is a game-changer.",
      author: "DJ Sarah",
      role: "Mobile DJ, Miami",
      avatar: null,
    },
    {
      quote: "Best investment I've made for my DJ business. The library is massive and always up to date.",
      author: "DJ Marcus",
      role: "Wedding DJ, Chicago",
      avatar: null,
    },
  ];

  return (
    <section className="py-24 bg-tvp-bg-secondary">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tvp-text-primary mb-4">
            Trusted by DJs Worldwide
          </h2>
          <p className="text-lg text-tvp-text-secondary">
            Join thousands of professional DJs who've elevated their performances.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 rounded-xl bg-tvp-bg-primary border border-tvp-border-subtle">
            <Users className="w-8 h-8 text-tvp-accent-cyan mx-auto mb-3" />
            <div className="text-3xl font-bold text-tvp-text-primary">11,000+</div>
            <div className="text-sm text-tvp-text-muted">DJs Worldwide</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-tvp-bg-primary border border-tvp-border-subtle">
            <Download className="w-8 h-8 text-tvp-accent-cyan mx-auto mb-3" />
            <div className="text-3xl font-bold text-tvp-text-primary">1M+</div>
            <div className="text-sm text-tvp-text-muted">Downloads</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-tvp-bg-primary border border-tvp-border-subtle">
            <Globe className="w-8 h-8 text-tvp-accent-cyan mx-auto mb-3" />
            <div className="text-3xl font-bold text-tvp-text-primary">50+</div>
            <div className="text-sm text-tvp-text-muted">Countries</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-tvp-bg-primary border border-tvp-border-subtle">
            <Award className="w-8 h-8 text-tvp-accent-cyan mx-auto mb-3" />
            <div className="text-3xl font-bold text-tvp-text-primary">4.9</div>
            <div className="text-sm text-tvp-text-muted">User Rating</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-tvp-bg-primary border border-tvp-border-subtle"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-tvp-accent-gold fill-tvp-accent-gold" />
                ))}
              </div>
              <p className="text-tvp-text-secondary mb-4 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tvp-bg-elevated flex items-center justify-center">
                  <span className="text-tvp-text-muted font-medium">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-tvp-text-primary">{testimonial.author}</div>
                  <div className="text-sm text-tvp-text-muted">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FAQ SECTION
// ============================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What video formats do you offer?',
      answer: 'We provide MP4 videos in HD (720p), Full HD (1080p), and 4K quality depending on your subscription plan. Audio is embedded at 320kbps for crystal-clear sound.',
    },
    {
      question: 'What DJ software is compatible?',
      answer: 'Our videos work with all major DJ software including Serato Video, VirtualDJ, rekordbox Video, PCDJ DEX, and any software that supports MP4 video playback.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. There are no contracts or commitments. You can cancel your subscription at any time from your account settings, and you\'ll retain access until the end of your billing period.',
    },
    {
      question: 'How often is new content added?',
      answer: 'We add new content daily! Our team works around the clock to ensure you have access to the latest releases, often within days of the official video premiere.',
    },
    {
      question: 'Do you offer clean/radio edits?',
      answer: 'Yes! Most tracks come with multiple versions including clean edits, explicit versions, extended mixes, intros, outros, and quick hits - perfect for any venue or event type.',
    },
    {
      question: 'Is there an approval process to join?',
      answer: 'No approval needed. Create your account, choose your plan, and start downloading immediately. Instant access to our entire library.',
    },
  ];

  return (
    <section className="py-24 bg-tvp-bg-primary">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tvp-text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-tvp-text-secondary">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-tvp-border-subtle overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left bg-tvp-bg-secondary hover:bg-tvp-bg-tertiary transition-colors"
              >
                <span className="font-medium text-tvp-text-primary">
                  {faq.question}
                </span>
                <ChevronDown
                  className={clsx(
                    'w-5 h-5 text-tvp-text-muted transition-transform',
                    openIndex === i && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === i && (
                <div className="p-6 pt-0 bg-tvp-bg-secondary">
                  <p className="text-tvp-text-secondary">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FINAL CTA SECTION
// ============================================
function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-tvp-bg-secondary to-tvp-bg-primary">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-tvp-text-primary mb-6">
          Ready to Level Up Your Sets?
        </h2>
        <p className="text-xl text-tvp-text-secondary mb-8 max-w-2xl mx-auto">
          Join thousands of DJs who trust The Video Pool for their music video needs.
          Start with 50% off your first month.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-tvp-accent-cyan text-black font-semibold rounded-xl hover:bg-tvp-accent-cyan-hover transition-all duration-200 shadow-lg shadow-tvp-accent-cyan/25 hover:shadow-xl hover:shadow-tvp-accent-cyan/30"
          >
            Get Started Now
            <ChevronRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-tvp-bg-elevated text-tvp-text-primary font-semibold rounded-xl border border-tvp-border-default hover:border-tvp-accent-cyan/50 transition-colors"
          >
            View Pricing
          </a>
        </div>

        <p className="text-sm text-tvp-text-muted mt-6">
          No credit card required to browse. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

// ============================================
// NAVBAR
// ============================================
function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-tvp-bg-primary/90 backdrop-blur-lg border-b border-tvp-border-subtle'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-tvp-accent-cyan flex items-center justify-center">
            <Play className="w-5 h-5 text-black" fill="black" />
          </div>
          <span className="text-xl font-bold text-tvp-text-primary">
            The Video Pool
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#pricing" className="text-tvp-text-secondary hover:text-tvp-text-primary transition-colors">
            Pricing
          </a>
          <Link to="/login" className="text-tvp-text-secondary hover:text-tvp-text-primary transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-tvp-accent-cyan text-black font-semibold rounded-lg hover:bg-tvp-accent-cyan-hover transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Link
            to="/register"
            className="px-4 py-2 bg-tvp-accent-cyan text-black font-semibold rounded-lg text-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// FOOTER
// ============================================
function LandingFooter() {
  return (
    <footer className="bg-tvp-bg-primary border-t border-tvp-border-subtle">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-tvp-accent-cyan flex items-center justify-center">
                <Play className="w-4 h-4 text-black" fill="black" />
              </div>
              <span className="text-lg font-bold text-tvp-text-primary">
                The Video Pool
              </span>
            </div>
            <p className="text-sm text-tvp-text-muted">
              The premier DJ video pool for professionals who demand excellence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-tvp-text-primary mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#pricing" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">Features</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">Genres</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">New Releases</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-tvp-text-primary mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-tvp-text-primary mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">DMCA</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-tvp-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-tvp-text-muted">
            © {new Date().getFullYear()} The Video Pool. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-tvp-text-muted hover:text-tvp-text-primary transition-colors">
              <span className="sr-only">YouTube</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN LANDING PAGE COMPONENT
// ============================================
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-tvp-bg-primary">
      {/* Demo/Preview Banner */}
      <div className="bg-gradient-to-r from-tvp-accent-cyan to-tvp-accent-purple py-2 text-center">
        <p className="text-white text-sm font-medium">
          🎬 PREVIEW MODE - Frontend Demo (Backend API Coming Soon)
        </p>
      </div>

      <LandingNavbar />
      <main>
        <HeroSection />
        <ValuePropsSection />
        <ContentPreviewSection />
        <PricingSection />
        <FeaturesSection />
        <SocialProofSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
