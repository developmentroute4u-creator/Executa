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

/* ── Freelancer Article Data ─────────────────────────────────────── */
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
        title: "Welcome to Executa for Experts",
        readTime: "3 min",
        content: `## Welcome to Executa

Executa is a premium freelance marketplace built to match top-tier expert developer talent with high-intent clients. Our business model is designed around **locked scope, zero commissions, and complete financial security**.

### How Executa works for Freelancers

1. **Verify your skills** — Complete our Level 2 Assessment to qualify for projects.
2. **Review incoming matches** — View structured scopes matched to your tech stack and expertise.
3. **Accept & fund** — Accept a match. The client funds the first milestone into escrow before you start coding.
4. **Deliver milestones** — Deliver work according to the specific criteria in the scope.
5. **Instant release** — Upon approval or after the 7-day automatic review window, funds are released directly to your wallet.
6. **No platform fees** — Freelancers keep **100% of their earnings**. The client pays all service fees.

### Key Rules of the Platform

| Feature | Rule / Description |
|---|---|
| Commissions | 0% fee. You receive exactly what you quoted. |
| Working off-platform | Strictly prohibited. Leads to account termination. |
| Milestone funding | Never start work until the milestone is funded in escrow. |
| Verification | Tiers are reassessed every 6 months to match your performance. |`,
      },
      {
        id: "gs-2",
        title: "Completing your Level 2 Skills Assessment",
        readTime: "4 min",
        content: `## Level 2 Skills Assessment

Every freelancer on Executa must pass a standard evaluation before receiving project matches. This process ensures only premium talent is matched with clients, allowing us to maintain high budgets and professional engagements.

### The Assessment Process

1. **Submit application** — Provide your resume, GitHub profile, and primary tech stack.
2. **Technical screening** — Complete a 90-minute real-world coding challenge testing system design, performance, and best practices.
3. **Portfolio review** — A senior architect audits your past code submissions for quality and architecture patterns.
4. **Vetting & Tier Assignment** — Once passed, you are assigned an expert tier:
   - **Mid-Tier (L1)**: Handled complex tasks under supervision.
   - **Senior Expert (L2)**: Full capability to architecture, build, and deliver projects independently.
   - **Architect (L3)**: High-scale system design and cross-functional leadership.

### Preparation Tips

- **Best practices matter** — We evaluate test coverage, directory structuring, error handling, and clean code comments.
- **Explain your decisions** — Include a comprehensive README detailing your architectural choices, state management design, and database normalization choices.
- **Focus on security** — Sanitize all inputs, avoid security gotchas, and manage session tokens securely.`,
      },
      {
        id: "gs-3",
        title: "Understanding the Project Matching Queue",
        readTime: "3 min",
        content: `## Understanding the Project Matching Queue

Executa does not use bidding or proposal contests. Instead, our automated matching system connects the right expert with the right project scope.

### How Matching Logic Works

Our engine analyses the AI-generated scope requirements against your expert profile using three criteria:
- **Verified Tech Stack** — Matching your assessed capabilities directly to the technology required in the deliverables.
- **Availability & Bandwidth** — Prioritising experts with active availability toggles who are not currently capped on active projects.
- **Performance History** — Quality of past deliverables, on-time submissions, and client feedback ratings.

### Maximising Your Matches

1. Keep your availability toggle **Active** in your settings.
2. Maintain your profile with your latest verified stack proficiencies.
3. Complete active projects on time to boost your matching priority score.
4. If you decline a match, specify the reason so the engine can learn your preferences.`,
      },
    ],
  },
  {
    id: "milestones",
    label: "Milestones & Deliveries",
    icon: <FileText size={18} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    articles: [
      {
        id: "ms-1",
        title: "How to submit work for milestone review",
        readTime: "3 min",
        content: `## How to submit work for milestone review

When you finish a milestone's deliverables, submit them formally to trigger the client's review window.

### Step-by-step Submission

1. Go to your active **Workspace** and open the **Milestones** tab.
2. Select the current active milestone and click **Submit Milestone**.
3. Provide submission details:
   - **Deployment link** (e.g. Vercel, Staging environment URL)
   - **GitHub Pull Request link** or secure repository path
   - **Demo video** or screenshots showing the criteria met
   - **Summary of deliverables completed**
4. Click **Submit**.

### The 7-Day Auto-Approval Rule

Once submitted:
- The client has **5 business days** to review and approve the work.
- If they do not take action, request revisions, or raise a dispute within **7 calendar days**, the system **automatically approves** the milestone and releases the escrowed funds to your wallet.
- This protects you from client absence or unresponsive review states.`,
      },
      {
        id: "ms-2",
        title: "Handling client revision requests",
        readTime: "3 min",
        content: `## Handling client revision requests

Clients can request revisions if a deliverable does not meet the criteria specified in the locked scope.

### Revision Rules

- **Limit** — Unless custom rules are set in the scope, clients receive a maximum of **2 revision rounds** per milestone.
- **Scope Restriction** — Revisions *must* align strictly with the locked scope document. A client cannot request new features under the guise of a revision.
- **Turnaround Time** — You have **48 business hours** to address and resubmit after a revision request.

### Best Practices

1. **Clarify requirements** — If a revision request is vague, ask for specific steps to reproduce the issue inside the workspace chat.
2. **Document fixes** — When resubmitting, include a changelog explaining exactly how you resolved the client's comments.
3. **Reject out-of-scope revisions** — If a client requests new functionality, gently explain that this is out-of-scope and offer to create a Scope Upgrade.`,
      },
    ],
  },
  {
    id: "earnings",
    label: "Earnings & Payments",
    icon: <CreditCard size={18} />,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    articles: [
      {
        id: "earn-1",
        title: "How escrow protects your earnings",
        readTime: "3 min",
        content: `## How escrow protects your earnings

Escrow is the heart of Executa's commitment to freelancers. It guarantees that you will be paid for the work you do.

### The Escrow Guarantee

- **Pre-Funded Milestones** — The expert is never expected to start a milestone until the client has paid the funds into Executa's escrow account.
- **Independent Security** — Once in escrow, the client cannot simply withdraw their money back to their bank account without your consent or going through the formal dispute process.
- **Guaranteed Payout** — As long as you deliver the deliverables matching the locked scope, the escrowed funds are legally guaranteed to be released to you.

### What to check before starting work

Always look at the milestone card in your project view:
- If it shows **Funded**, you are secure to start working.
- If it shows **Unfunded / Pending**, do not start work yet. Send a gentle reminder in the chat for the client to fund the milestone.`,
      },
      {
        id: "earn-2",
        title: "Withdrawing your wallet balance",
        readTime: "2 min",
        content: `## Withdrawing your wallet balance

Once a milestone is approved, the funds enter your wallet balance immediately. You can withdraw them to your bank account at any time.

### Withdrawal Process

1. Go to your **Earnings** tab from the sidebar.
2. Click **Withdraw Funds**.
3. Choose your linked payout method (Bank Account, UPI, or Stripe for international payouts).
4. Enter the amount to withdraw.
5. Click **Confirm**.

### Processing Times & Fees

- **UPI & IMPS (India)**: instant processing, available 24/7.
- **NEFT / RTGS (India)**: 2–4 hours during business days.
- **International Transfers (Stripe/SWIFT)**: 2–5 business days depending on destination country.
- **Withdrawal Fees**: Executa charges ₹0 withdrawal fee. Any fees you see are direct network/forex rates charged by the payment gateway.`,
      },
    ],
  },
  {
    id: "disputes",
    label: "Disputes & Scope Conflicts",
    icon: <AlertCircle size={18} />,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    articles: [
      {
        id: "disp-1",
        title: "What is a scope boundary conflict?",
        readTime: "4 min",
        content: `## Scope Boundary Conflicts

A scope boundary conflict occurs when a client requests additions, modifications, or feature adjustments that are not specified in the locked scope document.

### How to raise a scope conflict

If a client requests out-of-scope work:
1. Navigate to the **Workspace** of the project.
2. Click the **Flag Scope Boundary** action button in the chat or milestone drawer.
3. Select the messages where the client requested the work and write a short explanation of why it exceeds the scope.
4. This freezes the milestone progress, alerts the client, and notifies the Executa audit team.

### Live Audit Engagement

- Once flagged, Executa's senior audit panel inspects the secure chat log, the locked scope document, and the deliverables.
- If the auditor agrees the request is out-of-scope, the client must either withdraw the request or pay for a **Scope Upgrade** (a mini-scope addition with its own funded escrow payment).
- The auditor's decision is final and binding for both parties.`,
      },
      {
        id: "disp-2",
        title: "How Executa resolves disputes",
        readTime: "4 min",
        content: `## How Executa resolves disputes

When a disagreement cannot be resolved through revisions, a dispute is initiated. Our resolution process is evidence-based and objective.

### The Dispute Process

1. **Initiation** — A dispute can be opened by either party if a milestone is rejected or when a scope conflict cannot be settled.
2. **Evidence Collection** — Both parties have 48 hours to submit their logs, code, designs, and notes.
3. **Auditor Inspection** — An independent technical auditor reviews the locked scope deliverables against the submitted artifacts and code.
4. **Resolution Ruling** — The auditor makes one of three rulings:
   - **Deliverables Met**: 100% of escrowed funds release to the expert.
   - **Deliverables Unfinished**: Funds are returned to the client.
   - **Partial Delivery**: Funds are split proportionally based on the value of the completed features.

### Tips for Freelancers during a dispute
- Keep all communication inside the Executa project workspace chat. External communications (Slack, WhatsApp, Email) are not accepted as evidence.
- Ensure your code is pushed to the secure Executa repository branch regularly so the technical auditor can inspect your contributions.`,
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

export default function FreelancerArticles() {
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
    <main className="flex-1 overflow-y-auto bg-background min-h-screen font-sans selection:bg-accent/10 selection:text-accent flex flex-col justify-center py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 w-full">
        <AnimatePresence mode="wait">
          {activeArticle ? (
            <ArticleView key="article" article={activeArticle} onBack={() => setActiveArticle(null)} />
          ) : (
            <motion.div key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

              {/* Header */}
              <header className="mb-10 border-b border-border/40 pb-6">
                {activeCategory && (
                  <button onClick={() => setActiveCategory(null)} className="flex items-center gap-2 text-xs font-bold text-text-tertiary hover:text-accent transition-colors mb-5 group">
                    <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> All Categories
                  </button>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="text-accent w-4 h-4" strokeWidth={2.5} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">Help Center & Documentation</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
                  {displayCategory ? displayCategory.label : "Freelancer Help Center"}
                </h1>
                <p className="text-text-secondary font-sans text-sm mt-2">
                  {displayCategory ? `Browse articles related to ${displayCategory.label.toLowerCase()}` : "Complete documentation, policies, and guidelines for experts."}
                </p>
              </header>

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
                  {[allArticles[0], allArticles[3], allArticles[5]].filter(Boolean).map(a => (
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
  </main>
);
}
