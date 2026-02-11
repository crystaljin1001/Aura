# Aura: The Operating System for the One-Person Company

**"Manifest your professional aura. Stop being a line item; become a product."**

Aura is a high-signal "Proof of Work" engine designed for the 2026 software engineer and product manager. It moves beyond the "GitHub Maze" to provide a visual, outcome-oriented storefront that turns your technical skills into a compelling story that recruiters and clients want to buy in under 10 seconds.

## 🚀 The Core Philosophy: Clarity as a Moat

In an era of AI-generated "slop," the only durable competitive advantage is **Clarity of Intent**. Aura isn't just a hosting provider; it's an instructional layer that helps high-agency builders **Narrate** and **Sell** their output.

## ✨ Core Functions (MVP Roadmap)

### 1. The "10-Second" Visual Hook
**Feature:** Visual-First Landing Page & Mobile-First "Quick Peek."

**Impact:** Prioritizes high-quality visuals and headers knowing recruiters "never read body copy". 70% of professional browsing happens on mobile; Aura ensures your first impression is perfect on every screen.

### 2. The GitHub Impact Engine
**Feature:** GitHub "Outcome" Integration & Business Impact Overlays.

**Impact:** Automatically extracts repo metadata to generate "Impact Cards" (e.g., "Resolved 40 critical issues"). It proves results without requiring a recruiter to navigate your code.

### 3. Narrative Storyboarder (The Script)
**Feature:** AI Demo Playbook.

**Impact:** An agentic workflow that turns your README into a professional 60-second video demo script using a structured **Context → Problem → Process → Outcome** narrative.

### 4. Professional Infrastructure Layer
**Feature:** Custom Domain Mapping.

**Impact:** Automates SSL issuance and renewals via Cloudflare for SaaS. No "90-day SSL renewal treadmill"—just professional .dev or .io branding.

### 5. Anti-Decay Sync
**Feature:** Automated Syncing (GitHub Only).

**Impact:** Prevents "portfolio decay" by automatically reflecting your latest commits and activity, ensuring you always appear as an active builder.

## 🛠 Tech Stack (Solo Founder Optimized)

Designed for speed, security, and low maintenance:

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS + Radix UI
- **Backend/Auth:** Supabase (PostgreSQL with RLS)
- **Infrastructure:** Cloudflare for SaaS (Custom Domain API)
- **AI Engine:** Model Cascading (GPT-4o mini for extraction / Claude 3.7 for scripts)

## 🛡 Security-by-Design

- **Zero-Trust Permissions:** Strict `.claude/settings.json` configuration to prevent unauthorized tool execution
- **Automated Guardrails:** Pre-commit Semgrep scans to block hardcoded keys or XSS vulnerabilities in "Impact Cards"
- **Sandbox Isolation:** No hosting of untrusted user code; Aura proxies to verified providers like Vercel or Netlify

## 📈 Business Model: Charge-by-Result

- **Tier 1:** Free repository linking and basic profile
- **Tier 2 (Prepaid Credits):** Pay-per-Publish to custom domains
- **Tier 3 (Outcome-Based):** One-time fee for AI-generated high-fidelity video demo scripts

## 🏗 Getting Started

Aura is currently in **Private Alpha**.

```bash
npm install
```

Configure `.env.local` with your Supabase and GitHub credentials.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Aura instance.

## 🎯 Current Features (Implemented)

✅ **Authentication System** - Secure email/password auth with Supabase
✅ **Repository Management** - Add/remove GitHub repos via UI
✅ **Narrative Storyboarder** - AI-powered video script generation
✅ **Impact Engine (Infrastructure)** - Backend ready for GitHub integration
✅ **Mobile-First Design** - Responsive layouts across all features

## 📚 Documentation

- [Security Guidelines](./SECURITY.md)
- [Development Guide](./CLAUDE.md)

## 🤝 Contributing

This is a private alpha project. If you're interested in contributing or learning more, reach out to the project maintainer.

## 📄 License

Private - All Rights Reserved

---

**Built with clarity. Designed for impact.**
