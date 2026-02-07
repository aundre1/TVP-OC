# The Video Pool - Technical Specification Document
## Complete UI/UX Redesign - January 2026

---

## Document Information

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Date** | January 13, 2026 |
| **Author** | TVP Development Council |
| **Status** | Approved for Implementation |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Philosophy](#2-design-philosophy)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Layout Architecture](#5-layout-architecture)
6. [Component Library](#6-component-library)
7. [Page Specifications](#7-page-specifications)
8. [Interaction Design](#8-interaction-design)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Performance Requirements](#10-performance-requirements)
11. [Accessibility Standards](#11-accessibility-standards)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. Executive Summary

### Project Overview
Complete redesign of The Video Pool's user interface to create a world-class video DJ content platform that rivals Spotify, Netflix, and Beatport in user experience while serving the unique needs of professional video DJs.

### Key Objectives
- Create stunning visual design that appeals to video DJs worldwide
- Enable rapid content discovery and download efficiency
- Implement Spotify-level recommendation systems
- Build for scale (tens of thousands of videos)
- Support hybrid grid/list view modes
- Deliver full interactivity with hover previews and instant downloads

### Design Council Approval
This specification was developed with input from industry executives including perspectives from:
- YouTube, Spotify, Apple Music, Netflix (streaming/UX)
- Beatport, Serato, Pioneer DJ (DJ-specific workflows)
- Live Nation, Eventbrite (event/entertainment)
- SmashVision, BPM Supreme, DJcity (competitive analysis)

---

## 2. Design Philosophy

### Core Principles

#### 2.1 Video-First Thinking
- Thumbnails are the primary content preview
- Every design decision prioritizes video visibility
- Hover states trigger video preview playback
- High contrast ensures thumbnails pop

#### 2.2 DJ Workflow Optimization
- Minimize clicks to download
- Support rapid browsing and filtering
- Enable batch operations
- Integrate with DJ software exports

#### 2.3 Nightlife Aesthetic
- Dark mode default (DJs work at night)
- Neon accents evoke club/LED wall culture
- Premium feel without corporate coldness
- International appeal (no culture-specific colors)

#### 2.4 Progressive Disclosure
- Essential actions always visible
- Advanced filters in expandable sections
- Keyboard shortcuts for power users
- Tooltips reveal additional functionality

### Design Language

```
VISUAL HIERARCHY:
1. Video thumbnails (largest, most prominent)
2. Title/Artist information
3. Quick actions (download, add to crate)
4. Metadata (BPM, key, duration, resolution)
5. Navigation and filters
```

---

## 3. Color System

### 3.1 Primary Palette

```css
:root {
  /* Background Colors */
  --bg-primary: #0a0a0f;        /* Rich Black - main background */
  --bg-secondary: #141419;       /* Dark Charcoal - cards, elevated */
  --bg-tertiary: #1e1e24;        /* Charcoal - hover, borders */
  --bg-elevated: #252530;        /* Elevated surfaces */

  /* Text Colors */
  --text-primary: #f5f5f7;       /* Off White - headlines */
  --text-secondary: #a1a1aa;     /* Cool Grey - body text */
  --text-muted: #6b6b76;         /* Slate - captions, metadata */
  --text-disabled: #45454d;      /* Disabled text */

  /* Accent Colors */
  --accent-cyan: #00d4ff;        /* Electric Cyan - primary accent */
  --accent-cyan-hover: #33ddff;  /* Bright Cyan - hover states */
  --accent-cyan-glow: rgba(0, 212, 255, 0.25);
  --accent-cyan-subtle: rgba(0, 212, 255, 0.1);

  --accent-coral: #ff6b4a;       /* Warm Coral - secondary accent */
  --accent-coral-hover: #ff8566; /* Bright Coral - hover */
  --accent-coral-glow: rgba(255, 107, 74, 0.25);

  /* Semantic Colors */
  --success: #00e676;            /* Mint Green */
  --warning: #ffab00;            /* Amber */
  --error: #ff4757;              /* Crimson */
  --info: #00d4ff;               /* Uses cyan */

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.15);
  --border-accent: rgba(0, 212, 255, 0.3);
}
```

### 3.2 Gradients (Use Sparingly)

```css
:root {
  /* Premium gradient - hero sections, badges */
  --gradient-premium: linear-gradient(135deg, #00d4ff 0%, #00e676 100%);

  /* Hot/New content gradient */
  --gradient-hot: linear-gradient(135deg, #ff6b4a 0%, #ffab00 100%);

  /* Subtle card gradient */
  --gradient-card: linear-gradient(180deg, #1e1e24 0%, #141419 100%);

  /* Glow effects */
  --glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
  --glow-coral: 0 0 20px rgba(255, 107, 74, 0.3);
}
```

### 3.3 Color Usage Guidelines

| Element | Color | Notes |
|---------|-------|-------|
| Page background | `--bg-primary` | Never pure black |
| Cards | `--bg-secondary` | Slight elevation from bg |
| Card hover | `--bg-tertiary` | Visible state change |
| Primary buttons | `--accent-cyan` | Downloads, primary CTA |
| Secondary buttons | `--bg-tertiary` | With border |
| New/Hot badges | `--accent-coral` | Draws attention |
| Exclusive badge | `--accent-cyan` | Premium feel |
| Download progress | `--success` | Positive feedback |
| Active nav item | `--accent-cyan` | Current location |
| Links | `--accent-cyan` | Interactive elements |

---

## 4. Typography

### 4.1 Font Stack

```css
:root {
  /* Primary font - UI and body */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Display font - headlines and large text */
  --font-display: 'Plus Jakarta Sans', var(--font-primary);

  /* Monospace - numbers, BPM, time, code */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}
```

### 4.2 Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display-xl` | 48px | 800 | 1.1 | Hero headlines |
| `display-lg` | 36px | 700 | 1.2 | Section titles |
| `heading-lg` | 24px | 700 | 1.3 | Card titles, page headers |
| `heading-md` | 20px | 600 | 1.3 | Subsection headers |
| `heading-sm` | 16px | 600 | 1.4 | Component headers |
| `body-lg` | 16px | 400 | 1.5 | Primary body text |
| `body-md` | 14px | 400 | 1.5 | Secondary text |
| `body-sm` | 13px | 400 | 1.4 | Metadata, captions |
| `caption` | 11px | 500 | 1.3 | Labels, badges |
| `mono-lg` | 18px | 600 | 1.2 | Large numbers (BPM) |
| `mono-md` | 14px | 500 | 1.2 | Time, counts |
| `mono-sm` | 12px | 400 | 1.2 | Small metrics |

### 4.3 Typography Implementation

```css
.display-xl {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.body-md {
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
}

.mono-metric {
  font-family: var(--font-mono);
  font-feature-settings: 'tnum' 1;
  letter-spacing: 0.02em;
}
```

---

## 5. Layout Architecture

### 5.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STICKY HEADER (64px height, z-index: 100)                                   │
│ └─ Logo | Navigation | Search | User Menu                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ STICKY KPI STRIP (48px height, z-index: 90)                                 │
│ └─ New count | Downloads | Library size | Queue status                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ STICKY FILTER BAR (56px height, z-index: 80)                                │
│ └─ Genre | BPM | Key | Decade | Resolution | Search | View Toggle           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ MAIN CONTENT AREA (scrollable)                                              │
│ ├─ Discovery Swimlanes (horizontal scroll rows)                             │
│ │   └─ New This Week                                                        │
│ │   └─ Trending                                                             │
│ │   └─ Recommended For You                                                  │
│ │   └─ Recently Downloaded                                                  │
│ ├─ Main Grid/List (infinite scroll, virtualized)                            │
│ │   └─ Video cards in responsive grid                                       │
│ └─ Load More / Infinite Scroll Trigger                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Grid System

```css
/* Container */
.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}

/* Video Grid */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Swimlane */
.swimlane {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
}

.swimlane::-webkit-scrollbar {
  display: none;
}

.swimlane-item {
  flex: 0 0 200px;
  scroll-snap-align: start;
}
```

### 5.3 Spacing System

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## 6. Component Library

### 6.1 Video Card - Grid View

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ ← 16:9 aspect ratio
│ │      [VIDEO THUMBNAIL]          │ │
│ │                                 │ │
│ │  ▶ Preview plays on hover       │ │
│ │                                 │ │
│ │                      ┌────────┐ │ │
│ │                      │ 1080p  │ │ │ ← Resolution badge
│ │                      └────────┘ │ │
│ │                         3:42    │ │ ← Duration
│ └─────────────────────────────────┘ │
│                                     │
│ Uptown Funk                         │ ← Title (truncate 2 lines)
│ Bruno Mars ft. Mark Ronson          │ ← Artist (truncate 1 line)
│                                     │
│ 115 BPM  •  4A  •  Clean            │ ← Metadata row
│                                     │
│ ┌─────────────────┐ ┌─────────────┐ │
│ │   ⬇ Download    │ │  + Crate    │ │ ← Action buttons
│ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────┘

Width: minmax(280px, 1fr)
Thumbnail: 16:9 aspect ratio
Border radius: 12px (card), 8px (thumbnail)
Padding: 16px (content area)
Gap: 12px (between sections)
```

**CSS Implementation:**

```css
.video-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.video-card:hover {
  border-color: var(--accent-cyan);
  transform: translateY(-4px);
  box-shadow: var(--glow-cyan);
}

.video-card__thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.video-card__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-card__thumbnail img {
  transform: scale(1.05);
}

.video-card__badges {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}

.video-card__duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: var(--text-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--font-mono);
}

.video-card__content {
  padding: 16px;
}

.video-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.video-card__artist {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 12px;
}

.video-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-bottom: 16px;
}

.video-card__meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.video-card__actions {
  display: flex;
  gap: 8px;
}
```

### 6.2 Video Card - List View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                                    │
│ │THUMB │  Uptown Funk                    Bruno Mars   115   4A   3:42  1080p│
│ │64x36 │  Mark Ronson ft. Bruno Mars     ft. Mark R.  BPM        Clean      │
│ └──────┘                                                          [⬇] [+]  │
└─────────────────────────────────────────────────────────────────────────────┘

Height: 72px
Thumbnail: 64x36px (16:9)
Columns: Thumbnail | Title/Subtitle | Artist | BPM | Key | Duration | Quality | Actions
```

**CSS Implementation:**

```css
.video-list-item {
  display: grid;
  grid-template-columns: 64px 1fr 150px 60px 50px 60px 70px 80px;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  transition: background 0.15s ease;
}

.video-list-item:hover {
  background: var(--bg-tertiary);
}

.video-list-item__thumbnail {
  width: 64px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.video-list-item__info {
  min-width: 0;
}

.video-list-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-list-item__subtitle {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-list-item__meta {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-secondary);
}
```

### 6.3 Buttons

```css
/* Primary Button - Cyan */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--accent-cyan);
  color: #000;
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: var(--accent-cyan-hover);
  box-shadow: var(--glow-cyan);
}

/* Secondary Button - Outlined */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-strong);
}

/* Icon Button */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: var(--accent-cyan-subtle);
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

/* Download Button - Special */
.btn-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--accent-cyan);
  color: #000;
  font-weight: 600;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-download:hover {
  background: var(--accent-cyan-hover);
  box-shadow: var(--glow-cyan);
  transform: translateY(-1px);
}

.btn-download--downloading {
  background: var(--bg-tertiary);
  color: var(--accent-cyan);
  pointer-events: none;
}
```

### 6.4 Badges

```css
/* Resolution Badge */
.badge-resolution {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 4px;
}

.badge-resolution--4k {
  background: var(--accent-cyan);
  color: #000;
}

/* New Badge */
.badge-new {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: var(--accent-coral);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 4px;
}

/* Exclusive Badge */
.badge-exclusive {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--gradient-premium);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 4px;
}

/* Genre Badge */
.badge-genre {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  border-radius: 20px;
  transition: all 0.15s ease;
  cursor: pointer;
}

.badge-genre:hover {
  background: var(--accent-cyan-subtle);
  color: var(--accent-cyan);
}

.badge-genre--active {
  background: var(--accent-cyan);
  color: #000;
}
```

### 6.5 Filter Bar

```css
.filter-bar {
  position: sticky;
  top: 112px; /* Header + KPI strip height */
  z-index: 80;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.filter-select {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 13px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-select:hover {
  border-color: var(--border-default);
  color: var(--text-primary);
}

.filter-select--active {
  background: var(--accent-cyan-subtle);
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.filter-search {
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  transition: all 0.15s ease;
}

.filter-search:focus-within {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 3px var(--accent-cyan-subtle);
}

.filter-search input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.filter-search input::placeholder {
  color: var(--text-muted);
}

.view-toggle {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 6px;
  padding: 2px;
}

.view-toggle__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  background: transparent;
  color: var(--text-muted);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-toggle__btn--active {
  background: var(--accent-cyan);
  color: #000;
}
```

### 6.6 KPI Strip

```css
.kpi-strip {
  position: sticky;
  top: 64px; /* Header height */
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kpi-item__icon {
  font-size: 16px;
}

.kpi-item__label {
  font-size: 13px;
  color: var(--text-muted);
}

.kpi-item__value {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.kpi-item__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--accent-coral);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
}
```

### 6.7 Command Palette (Ctrl+K)

```css
.command-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.command-overlay--open {
  opacity: 1;
  visibility: visible;
}

.command-modal {
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  z-index: 201;
  width: 90%;
  max-width: 640px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.command-overlay--open + .command-modal,
.command-modal--open {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.command-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.command-input-wrapper svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
}

.command-input::placeholder {
  color: var(--text-muted);
}

.command-kbd {
  padding: 4px 8px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 11px;
  font-family: var(--font-mono);
  border-radius: 4px;
}

.command-results {
  max-height: 400px;
  overflow-y: auto;
}

.command-section {
  padding: 8px 0;
}

.command-section-title {
  padding: 8px 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.command-item:hover,
.command-item--selected {
  background: var(--accent-cyan-subtle);
}

.command-item__icon {
  width: 40px;
  height: 24px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.command-item__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.command-item__info {
  flex: 1;
  min-width: 0;
}

.command-item__title {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.command-item__subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.command-item__action {
  font-size: 12px;
  color: var(--accent-cyan);
}
```

### 6.8 Toast Notifications

```css
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 300;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  min-width: 320px;
  max-width: 420px;
  transform: translateX(120%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast--show {
  transform: translateX(0);
  opacity: 1;
}

.toast--success {
  border-left: 4px solid var(--success);
}

.toast--error {
  border-left: 4px solid var(--error);
}

.toast--info {
  border-left: 4px solid var(--accent-cyan);
}

.toast__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.toast__message {
  font-size: 13px;
  color: var(--text-secondary);
}

.toast__close {
  flex-shrink: 0;
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s ease;
}

.toast__close:hover {
  color: var(--text-primary);
}
```

---

## 7. Page Specifications

### 7.1 Browse Page (Main)

**URL:** `/browse` or `/`

**Sections:**
1. Header (sticky)
2. KPI Strip (sticky)
3. Filter Bar (sticky)
4. Discovery Swimlanes
   - New This Week
   - Trending Now
   - Recommended For You
   - Recently Downloaded
5. Main Content Grid/List
6. Infinite Scroll Loader

**Features:**
- View toggle (grid/list)
- Multi-filter support
- Search with instant results
- Hover preview on thumbnails
- One-click download
- Batch selection mode

### 7.2 Video Detail Page

**URL:** `/video/:id`

**Sections:**
1. Header
2. Video Preview Player (16:9, autoplay muted)
3. Video Info Card
   - Title, Artist
   - Full metadata (BPM, key, duration, resolution, genre, year)
   - Download button (multiple quality options)
   - Add to crate/playlist
4. Related Videos Grid
5. Same Artist Section

### 7.3 Library Page

**URL:** `/library`

**Sections:**
1. Header
2. Library Stats Strip
3. Filter/Sort Bar
4. Downloaded Videos Grid/List
5. Crates/Playlists Sidebar

### 7.4 Crate/Playlist Page

**URL:** `/crate/:id`

**Sections:**
1. Header
2. Crate Info Card (name, count, duration)
3. Bulk Actions Bar (download all, export)
4. Crate Contents List
5. Drag-and-drop reordering

---

## 8. Interaction Design

### 8.1 Hover States

| Element | Hover Effect |
|---------|--------------|
| Video Card | Lift 4px, cyan border glow, thumbnail zoom 1.05x |
| Video Card Thumbnail | Play preview clip (after 500ms delay) |
| Buttons | Background shift, subtle shadow |
| List Items | Background color change |
| Links | Color shift to cyan |
| Badges | Slight scale (1.05x) |

### 8.2 Animations

```css
/* Standard easing */
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.4, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Durations */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* Card hover */
@keyframes card-lift {
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
}

/* Fade in up (for grid items loading) */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast slide in */
@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 8.3 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open command palette |
| `Escape` | Close modal/palette |
| `G` | Toggle grid view |
| `L` | Toggle list view |
| `D` | Download selected/focused video |
| `Space` | Play/pause preview |
| `Arrow keys` | Navigate grid/list |
| `Enter` | Open video detail |

### 8.4 Touch Gestures (Mobile)

| Gesture | Action |
|---------|--------|
| Tap | Select/open |
| Long press | Context menu |
| Swipe left | Quick add to crate |
| Swipe right | Quick download |
| Pull down | Refresh |
| Pinch | Zoom thumbnail |

---

## 9. Responsive Breakpoints

```css
/* Mobile first approach */

/* Extra small devices (phones, less than 576px) */
/* Base styles */

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .filter-bar {
    flex-wrap: nowrap;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* XXL devices (1400px and up) */
@media (min-width: 1400px) {
  .video-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

---

## 10. Performance Requirements

### 10.1 Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTFB | < 600ms | Time to First Byte |
| FCP | < 1.8s | First Contentful Paint |

### 10.2 Implementation Requirements

- **Image optimization:** WebP with JPEG fallback, responsive srcset
- **Lazy loading:** Intersection Observer for images below fold
- **Virtualization:** react-window for lists > 100 items
- **Code splitting:** Route-based lazy loading
- **Caching:** Service worker for static assets
- **CDN:** All media served from edge locations

### 10.3 Bundle Size Targets

| Bundle | Target | Max |
|--------|--------|-----|
| Initial JS | < 150KB | 200KB |
| Initial CSS | < 30KB | 50KB |
| Per-route chunk | < 50KB | 75KB |
| Total (gzipped) | < 250KB | 350KB |

---

## 11. Accessibility Standards

### 11.1 WCAG 2.1 AA Compliance

- **Color contrast:** Minimum 4.5:1 for text, 3:1 for large text
- **Focus indicators:** Visible focus states on all interactive elements
- **Keyboard navigation:** Full functionality without mouse
- **Screen reader support:** Proper ARIA labels and landmarks
- **Reduced motion:** Respect `prefers-reduced-motion`

### 11.2 Implementation Checklist

- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All buttons have accessible names
- [ ] Focus order is logical
- [ ] Skip links for main content
- [ ] ARIA landmarks (header, nav, main, footer)
- [ ] Live regions for dynamic content
- [ ] Error messages linked to inputs

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Priority 1-3)
1. Dark theme with approved color palette
2. Horizontal KPI strip
3. Sticky filter bar with DJ-specific filters

### Phase 2: Core Components (Priority 4-6)
4. Video card with hover preview
5. Grid/List view toggle
6. Infinite scroll with virtualization

### Phase 3: Discovery (Priority 7-8)
7. Command palette search (Ctrl+K)
8. Discovery swimlanes (New, Trending, For You)

### Phase 4: Polish (Priority 9-10+)
9. One-click download with toast notifications
10. Download queue panel
11. Keyboard shortcuts
12. Mobile responsiveness
13. Performance optimization
14. Accessibility audit

---

## Appendix A: Sample Data Structure

```javascript
// Video object
{
  id: "vid_12345",
  title: "Uptown Funk",
  artist: "Bruno Mars ft. Mark Ronson",
  bpm: 115,
  key: "4A",
  duration: 222, // seconds
  year: 2014,
  genre: "pop",
  resolution: "1080p",
  fileSize: 245000000, // bytes
  thumbnail: "/thumbs/vid_12345.webp",
  previewUrl: "/previews/vid_12345.mp4",
  downloadUrl: "/download/vid_12345",
  isNew: false,
  isExclusive: false,
  isTrending: true,
  downloadCount: 5247,
  addedAt: "2026-01-10T00:00:00Z",
  tags: ["clean", "radio-edit", "official"]
}
```

---

## Appendix B: API Endpoints

```
GET /api/videos
  ?page=1
  &limit=50
  &genre=pop
  &bpm_min=100
  &bpm_max=130
  &key=4A
  &resolution=1080p
  &sort=newest
  &search=bruno+mars

GET /api/videos/:id
GET /api/videos/:id/preview
GET /api/videos/:id/download

GET /api/recommendations
  ?type=for_you|trending|new|similar
  &videoId=vid_12345
  &limit=20

GET /api/library
GET /api/crates
POST /api/crates
PUT /api/crates/:id
DELETE /api/crates/:id
POST /api/crates/:id/videos
DELETE /api/crates/:id/videos/:videoId
```

---

**Document End**
*This specification is approved by The Video Pool Development Council*
*Implementation to begin immediately following document approval*
