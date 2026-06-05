"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, Search, ChevronRight, ArrowLeft, Clock,
  Zap, CreditCard, Users, Settings, ShieldCheck, FileText,
  LayoutDashboard, MessageSquare, Star, AlertCircle, HelpCircle,
  CheckCircle2, ChevronDown,
} from "lucide-react";

/* ── Article Data ────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: <Zap size={18} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    articles: [
      {
        id: "gs-1",
        title: "What is Executa and how does it work?",
        readTime: "3 min",
        content: `## What is Executa?

Executa is a premium freelance platform built for clients who need predictability. Unlike traditional platforms, Executa locks scope, price, and deliverables **before work begins** — eliminating the most common project failure points.

### How the process works

1. **Describe your project** — You tell us what you need in plain language. No technical specs required.
2. **AI scope generation** — Our system converts your brief into a structured scope document with milestones and deliverables.
3. **Review & lock** — You review the scope, request changes, and lock it. Once locked, no scope creep is possible.
4. **Expert matching** — Executa matches your project with a vetted, Level-2-assessed expert.
5. **Milestone payments** — You release payment only when each milestone is delivered and approved.
6. **Project complete** — Work is delivered, reviewed, and signed off. Your funds release automatically.

### Why Executa is different

| Traditional Freelance | Executa |
|---|---|
| Hourly billing | Fixed-price milestones |
| Self-reported CVs | Level 2 Skills Assessment |
| Scope changes constantly | Scope locked before work starts |
| No delivery guarantee | Milestone-gated payment release |

You're always in control — and you only pay for what's delivered.`,
      },
      {
        id: "gs-2",
        title: "Creating your client account",
        readTime: "2 min",
        content: `## Creating your client account

Getting started on Executa takes less than 2 minutes.

### Step-by-step

1. Go to **executa.in** and click **Hire a Freelancer**
2. Enter your email address and choose a strong password
3. Verify your email via the confirmation link sent to your inbox
4. Complete your profile — add your name, company (optional), and timezone
5. You're ready to post your first project

### What you'll need

- A valid email address
- A phone number for 2FA (recommended)
- A payment method for milestone deposits (added when you post a project)

### Tips for a strong profile
- Add a company logo if posting on behalf of a business — it increases expert response rates by 40%
- Set your timezone so our matching system can prioritize nearby experts when relevant`,
      },
      {
        id: "gs-3",
        title: "Understanding the scope document",
        readTime: "5 min",
        content: `## Understanding the scope document

The scope document is the foundation of every Executa project. It is a legally-binding, AI-generated summary of exactly what will be built, by when, and for how much.

### What's inside a scope document

**Project Summary** — A 2–3 sentence description of the project goal.

**Deliverables** — A numbered list of everything the expert is responsible for delivering. Each deliverable is specific and testable. For example:
> ✅ A working Stripe subscription checkout with monthly and annual plans
> ✅ Webhook handler for subscription cancellations with retry logic

**Milestones** — Deliverables grouped into time-bound milestones. Each milestone has:
- A due date
- A payment amount
- Clear acceptance criteria

**Out of Scope** — An explicit list of things *not* included. This prevents scope creep entirely.

**Revision Policy** — How many revision rounds are included per milestone.

### How to review your scope document

1. Read every deliverable carefully
2. Check "Out of Scope" — if something you need isn't there, raise it before locking
3. Confirm milestones and their payment amounts match your budget
4. Click **Lock Scope** once you are satisfied

Once locked, neither party can change the scope without renegotiating through the Executa dispute process.`,
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & Escrow",
    icon: <CreditCard size={18} />,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    articles: [
      {
        id: "pay-1",
        title: "How milestone payments and escrow work",
        readTime: "4 min",
        content: `## How milestone payments and escrow work

Executa uses a milestone-based escrow system that protects both you (the client) and the expert.

### The flow

1. **Project starts** — When your scope is locked and matched, you fund the first milestone into escrow.
2. **Expert works** — The expert delivers the milestone according to the scope document.
3. **You review** — You have 5 business days to review the delivered work.
4. **You approve** — Click "Approve Milestone" and funds release to the expert immediately.
5. **Next milestone** — You fund the next milestone and the cycle repeats.

### What is escrow?

Escrow is a secure holding account managed by Executa. When you fund a milestone, your money moves to escrow — it's no longer in your account, but it hasn't reached the expert either. It releases *only* when you approve.

### What happens if I don't approve?

- You can raise a **revision request** — the expert must address your specific feedback within 48 hours.
- If you're still unsatisfied after the revision round, you can open a **dispute**. Our team reviews both sides and mediates.
- If the deliverable genuinely wasn't completed per scope, a **full or partial refund** is issued.

### Supported payment methods

- Credit / Debit Cards (Visa, Mastercard, Amex)
- UPI (India)
- Net Banking (India)
- Wire Transfer (for projects > ₹5,00,000)`,
      },
      {
        id: "pay-2",
        title: "Platform fees explained",
        readTime: "2 min",
        content: `## Platform fees explained

Executa charges a transparent service fee on each transaction. There are no hidden charges.

### Client-side fees

| Transaction Type | Fee |
|---|---|
| Milestone payment | 2% of milestone value |
| International payments | Additional 1.5% forex conversion |
| Refunds | No fee — full amount returned |

### What the fee covers

- Escrow management and fund protection
- AI scope generation
- Expert matching and vetting
- Dispute resolution (if needed)
- 24/7 platform operations

### When are fees charged?

Fees are calculated and displayed **before** you confirm each milestone payment. You will always see the exact amount before clicking confirm.

### Tax invoices

A GST-compliant tax invoice is generated automatically for every transaction and available in your **Billing** section within 24 hours.`,
      },
      {
        id: "pay-3",
        title: "Requesting a refund",
        readTime: "3 min",
        content: `## Requesting a refund

Executa's escrow system is designed to protect your money. Refunds are available in specific situations.

### When you're eligible for a refund

- **Expert didn't deliver** — If the expert doesn't submit work by the milestone deadline, funds are automatically released back to you.
- **Work doesn't match scope** — If the delivered work clearly does not match the agreed scope document, open a dispute and our team will review.
- **Project cancelled before work started** — If you cancel before the expert has begun, a full refund is issued minus the platform fee.

### How to request a refund

1. Go to your **Project** page
2. Click the milestone in question
3. Select **Raise Dispute** or **Request Revision**
4. Describe specifically what wasn't delivered
5. Our support team responds within 4–8 hours

### Refund timeline

Once approved, refunds take **3–5 business days** to appear in your original payment method.`,
      },
    ],
  },
  {
    id: "projects",
    label: "Managing Projects",
    icon: <LayoutDashboard size={18} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    articles: [
      {
        id: "proj-1",
        title: "Posting your first project",
        readTime: "3 min",
        content: `## Posting your first project

Your first project on Executa is designed to be simple. Our AI does the heavy lifting.

### Step 1: Describe your idea

From your dashboard, click **New Project**. You'll be asked:
- What do you want to build? (plain English, 1–3 sentences)
- What's your approximate budget?
- What's your ideal timeline?

Don't overthink this — even rough descriptions generate excellent scope documents.

### Step 2: Review the AI-generated scope

Within seconds, Executa generates a structured scope document. Read through it and:
- Add any missing requirements using the **Edit Scope** tool
- Remove anything that isn't needed
- Confirm the milestone breakdown matches your budget

### Step 3: Lock the scope

When you're happy, click **Lock Scope**. This triggers the matching process.

### Step 4: Meet your expert

Within 24–48 hours, you'll be introduced to a matched expert. You'll see:
- Their skills assessment score
- Relevant past work
- A short introduction

You can accept the match or request a different expert (once per project).

### Step 5: Fund the first milestone

Fund the first milestone into escrow to begin the project. The expert is notified and work starts.`,
      },
      {
        id: "proj-2",
        title: "Communicating with your expert",
        readTime: "2 min",
        content: `## Communicating with your expert

Every Executa project includes a dedicated project chat workspace.

### What's available in the project workspace

- **Live chat** — Real-time messaging with your expert
- **File sharing** — Share designs, documents, references up to 100MB per file
- **Milestone updates** — The expert posts progress updates against each milestone
- **Scope reference** — The locked scope document is always visible in the sidebar

### Best practices for communication

- **Be specific with feedback** — Instead of "this isn't right," describe exactly what needs to change
- **Reference the scope** — When requesting changes, note which deliverable number it relates to
- **Respond promptly** — Experts work best with timely feedback; delays can affect timelines
- **Use revision requests formally** — Don't request scope changes through chat; use the official revision tool

### Response time expectations

Executa experts are expected to respond within **8 business hours**. If your expert goes silent for more than 24 hours, contact support immediately.`,
      },
      {
        id: "proj-3",
        title: "Inviting team members to your organization",
        readTime: "2 min",
        content: `## Inviting team members to your organization

You can give your colleagues access to view and manage projects.

### How to invite a team member

1. Go to **Organization** in the sidebar
2. Click **Invite Member**
3. Enter their email address
4. Select their role:
   - **Admin** — Full access, can approve milestones and payments
   - **Viewer** — Can read project updates, cannot take action

### Roles and permissions

| Action | Admin | Viewer |
|---|---|---|
| View project | ✅ | ✅ |
| Chat with expert | ✅ | ❌ |
| Approve milestones | ✅ | ❌ |
| Add payment method | ✅ | ❌ |
| Invite members | ✅ | ❌ |

### Removing a team member

Go to **Organization → Members**, find the member, and click **Remove**. Their access is revoked instantly.`,
      },
    ],
  },
  {
    id: "account",
    label: "Account & Security",
    icon: <ShieldCheck size={18} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    articles: [
      {
        id: "acc-1",
        title: "Changing your password and security settings",
        readTime: "2 min",
        content: `## Changing your password and security settings

Keeping your account secure is important. Here's how to manage your security settings.

### Changing your password

1. Go to **Account Settings**
2. Under **Security**, click **Change Password**
3. Enter your current password
4. Enter and confirm your new password (minimum 8 characters, at least 1 number)
5. Click **Save**

### Two-Factor Authentication (2FA)

We strongly recommend enabling 2FA:
1. Go to **Account Settings → Security**
2. Click **Enable 2FA**
3. Scan the QR code with Google Authenticator or Authy
4. Enter the 6-digit code to verify
5. Save your backup codes in a safe place

### If you've been locked out

Contact support at support@executa.in with your account email. We verify your identity and restore access within 2–4 hours.`,
      },
      {
        id: "acc-2",
        title: "Managing notifications",
        readTime: "2 min",
        content: `## Managing notifications

Stay informed without being overwhelmed. Executa lets you customize exactly what you're notified about.

### Notification types

| Event | Email | In-App |
|---|---|---|
| Milestone delivered | ✅ | ✅ |
| Expert message | ✅ | ✅ |
| Payment processed | ✅ | ✅ |
| Dispute update | ✅ | ✅ |
| Platform announcements | Optional | Optional |

### Adjusting notification settings

1. Click your avatar (top right)
2. Go to **Settings → Notifications**
3. Toggle each notification type on or off

### Email digest

Instead of individual emails, you can switch to a **daily digest** that summarizes all activity from the past 24 hours. This is ideal if you prefer fewer inbox interruptions.`,
      },
    ],
  },
  {
    id: "disputes",
    label: "Disputes & Resolutions",
    icon: <AlertCircle size={18} />,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    articles: [
      {
        id: "disp-1",
        title: "How the dispute process works",
        readTime: "4 min",
        content: `## How the dispute process works

Disputes are rare on Executa because of our scope-locking system. But when they do occur, our team handles them fairly and quickly.

### When to raise a dispute

Raise a dispute if:
- Delivered work clearly does not match the scope document
- The expert is unresponsive for more than 48 hours
- The expert is asking you to pay for things outside the locked scope

**Do not** raise a dispute for revision requests — use the revision tool first.

### The dispute process

1. **Open** — Go to the milestone, click **Raise Dispute**, and describe the issue with specific references to the scope document.
2. **Expert responds** — The expert has 48 hours to respond with their perspective.
3. **Evidence review** — Both parties can submit screenshots, files, and chat logs as evidence.
4. **Executa mediates** — Our resolution team reviews everything and makes a decision within 72 hours.
5. **Resolution** — Funds are released to the expert, refunded to you, or split depending on the finding.

### Tips for a strong dispute

- Always reference the exact deliverable number from the scope document
- Include screenshots and specific examples of what's missing or wrong
- Stay professional — disputes are reviewed by humans who read everything

### Appeal process

If you disagree with the resolution, you can appeal once within 7 days. Appeals are reviewed by a senior team member.`,
      },
    ],
  },
];

/* ── Component ─────────────────────────────────────────────── */
function ArticleView({ article, onBack }: { article: any; onBack: () => void }) {
  const lines = article.content.split("\n");
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-[740px] mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] font-bold text-stone-500 hover:text-[#E85239] transition-colors mb-8 group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Help Center
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Clock size={13} className="text-stone-400" />
        <span className="text-[12px] text-stone-400 font-medium">{article.readTime} read</span>
      </div>
      <h1 className="text-[28px] font-black text-stone-900 tracking-tight mb-8 leading-tight">{article.title}</h1>

      <div className="prose-custom">
        {lines.map((line: string, i: number) => {
          if (line.startsWith("## ")) return <h2 key={i} className="text-[20px] font-black text-stone-900 mt-8 mb-3 tracking-tight">{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={i} className="text-[16px] font-black text-stone-800 mt-6 mb-2">{line.slice(4)}</h3>;
          if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-[#E85239]/40 pl-4 my-3 text-[14px] text-stone-600 font-medium italic bg-orange-50/40 py-2 pr-4 rounded-r-xl">{line.slice(2)}</blockquote>;
          if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} className="flex items-start gap-2 my-1.5 text-[14px] text-stone-700"><span className="w-1.5 h-1.5 rounded-full bg-[#E85239]/60 mt-[7px] shrink-0" />{line.slice(2)}</div>;
          if (/^\d+\.\s/.test(line)) return <div key={i} className="flex items-start gap-3 my-2 text-[14px] text-stone-700"><span className="font-black text-[#E85239] shrink-0 min-w-[18px]">{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s/, "")}</span></div>;
          if (line.startsWith("|")) {
            const cells = line.split("|").filter(Boolean).map(c => c.trim());
            const isSep = cells.every(c => /^[-:]+$/.test(c));
            if (isSep) return null;
            return <div key={i} className="flex gap-0 text-[13px] border-b border-stone-100 last:border-0">{cells.map((c, ci) => <div key={ci} className={`flex-1 px-3 py-2 ${i === 0 ? "font-black text-stone-900 bg-stone-50" : "text-stone-600"}`}>{c}</div>)}</div>;
          }
          if (line === "") return <div key={i} className="h-3" />;
          return <p key={i} className="text-[14px] text-stone-600 leading-relaxed mb-1">{line}</p>;
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-stone-100">
        <p className="text-[13px] text-stone-500 font-medium mb-4">Was this article helpful?</p>
        <div className="flex gap-3">
          {["👍 Yes, helpful", "👎 Needs improvement"].map(label => (
            <button key={label} className="px-4 py-2 rounded-xl border border-stone-200 text-[12px] font-bold text-stone-600 hover:border-[#E85239]/40 hover:text-[#E85239] transition-colors bg-white">
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ClientArticles() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  const allArticles = CATEGORIES.flatMap(c => c.articles.map(a => ({ ...a, category: c.label, categoryId: c.id })));

  const filtered = search.trim()
    ? allArticles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const displayCategory = activeCategory ? CATEGORIES.find(c => c.id === activeCategory) : null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-8 lg:p-12">
      <AnimatePresence mode="wait">
        {activeArticle ? (
          <ArticleView key="article" article={activeArticle} onBack={() => setActiveArticle(null)} />
        ) : (
          <motion.div key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

            {/* Header */}
            <div className="mb-10">
              {activeCategory && (
                <button onClick={() => setActiveCategory(null)} className="flex items-center gap-2 text-[12px] font-bold text-stone-400 hover:text-[#E85239] transition-colors mb-5 group">
                  <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> All Categories
                </button>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#E85239]/10 flex items-center justify-center">
                  <BookOpen size={19} className="text-[#E85239]" />
                </div>
                <div>
                  <h1 className="text-[26px] font-black text-stone-900 tracking-tight">
                    {displayCategory ? displayCategory.label : "Client Help Center"}
                  </h1>
                  <p className="text-[13px] text-stone-400 font-medium">
                    {displayCategory ? `${displayCategory.articles.length} articles` : "Complete documentation for clients"}
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            {!activeCategory && (
              <div className="relative mb-10 max-w-[560px]">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-[14px] font-medium text-stone-800 placeholder-stone-300 outline-none focus:border-[#E85239]/40 focus:ring-1 focus:ring-[#E85239]/20 transition-all shadow-sm"
                />
              </div>
            )}

            {/* Search Results */}
            {search.trim() && (
              <div className="mb-8">
                <p className="text-[12px] font-bold text-stone-400 uppercase tracking-wider mb-4">{filtered.length} results for "{search}"</p>
                {filtered.length === 0 ? (
                  <div className="py-10 text-center text-stone-400">
                    <HelpCircle size={32} strokeWidth={1.5} className="mx-auto mb-3" />
                    <p className="font-medium text-[14px]">No articles found. Try different keywords.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filtered.map(a => (
                      <button key={a.id} onClick={() => { setActiveArticle(a); setSearch(""); }}
                        className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-100 hover:border-[#E85239]/30 hover:bg-orange-50/30 transition-all group">
                        <div>
                          <p className="text-[14px] font-bold text-stone-900 mb-0.5">{a.title}</p>
                          <p className="text-[11px] text-stone-400 font-medium">{a.category} · {a.readTime} read</p>
                        </div>
                        <ChevronRight size={16} className="text-stone-300 group-hover:text-[#E85239] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category Grid or Article List */}
            {!search.trim() && !activeCategory && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    whileHover={{ y: -2 }}
                    className="text-left p-6 bg-white rounded-3xl border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${cat.bg} ${cat.border} border flex items-center justify-center mb-4 ${cat.color}`}>
                      {cat.icon}
                    </div>
                    <h3 className="text-[15px] font-black text-stone-900 mb-1">{cat.label}</h3>
                    <p className="text-[12px] text-stone-400 font-medium mb-4">{cat.articles.length} articles</p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#E85239] opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse <ChevronRight size={12} />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Articles in category */}
            {displayCategory && (
              <div className="space-y-3">
                {displayCategory.articles.map((art, i) => (
                  <motion.button
                    key={art.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setActiveArticle(art)}
                    className="w-full text-left flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-100 hover:border-[#E85239]/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl ${displayCategory.bg} ${displayCategory.border} border flex items-center justify-center ${displayCategory.color} shrink-0`}>
                        <FileText size={15} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-stone-900">{art.title}</p>
                        <p className="text-[11px] text-stone-400 font-medium mt-0.5">{art.readTime} read</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-[#E85239] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Popular Articles (home only) */}
            {!search.trim() && !activeCategory && (
              <div className="mt-10">
                <p className="text-[12px] font-black uppercase tracking-widest text-stone-400 mb-4">Popular Articles</p>
                <div className="space-y-2">
                  {[allArticles[0], allArticles[3], allArticles[6], allArticles[8]].filter(Boolean).map(a => (
                    <button key={a.id} onClick={() => setActiveArticle(a)}
                      className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-100 hover:border-[#E85239]/30 hover:bg-orange-50/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <Star size={14} className="text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[13px] font-bold text-stone-900">{a.title}</p>
                          <p className="text-[11px] text-stone-400 font-medium">{a.category} · {a.readTime} read</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-stone-300 group-hover:text-[#E85239] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
