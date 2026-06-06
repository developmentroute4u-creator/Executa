"use client";
import { useState, useEffect } from "react";

const ACCESS_KEY = "Executa@Docs#2026";
const SESSION_KEY = "executa_docs_auth";

export default function PlatformDocsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored === "true") setUnlocked(true);
      setChecking(false);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_KEY) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password. Access denied.");
      setPassword("");
    }
  };

  if (checking) return null;

  if (!unlocked) {
    return (
      <div style={{
        minHeight: "100vh", background: "#FBF9F7", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif",
        padding: "24px"
      }}>
        <div style={{
          background: "#fff", border: "1px solid #E8E4E0", borderRadius: "20px",
          padding: "48px 40px", width: "100%", maxWidth: "400px",
          boxShadow: "0 20px 60px -20px rgba(0,0,0,0.08)"
        }}>
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-1px", color: "#1A1A1A", marginBottom: "8px" }}>
              EXECUTA<span style={{ color: "#E85239" }}>.</span>
            </div>
            <div style={{ fontSize: "13px", color: "#9A9A9A", marginTop: "4px" }}>
              Internal Platform Documentation
            </div>
          </div>

          <form onSubmit={handleUnlock}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "8px" }}>
                Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter access password"
                autoFocus
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "10px",
                  border: error ? "1.5px solid #E85239" : "1.5px solid #E8E4E0",
                  fontSize: "14px", color: "#1A1A1A", background: "#FAFAF9",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit"
                }}
              />
              {error && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#E85239", fontWeight: 500 }}>
                  {error}
                </div>
              )}
            </div>
            <button
              type="submit"
              style={{
                width: "100%", padding: "13px", background: "#E85239", color: "#fff",
                border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.2px", fontFamily: "inherit"
              }}
            >
              Unlock Document
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "#C4BFB9" }}>
            Restricted access · Executa Internal Only
          </div>
        </div>
      </div>
    );
  }

  // ── DOCUMENT CONTENT ──────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#FBF9F7", minHeight: "100vh", color: "#3D3D3D" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        :root {
          --brand: #E85239;
          --brand-light: #FCE1DC;
          --ink: #1A1A1A;
          --ink-2: #3D3D3D;
          --ink-3: #6B6B6B;
          --ink-4: #9A9A9A;
          --surface: #FAFAF9;
          --border: #E8E4E0;
          --warm-bg: #FBF9F7;
        }
        .doc-container { max-width: 900px; margin: 0 auto; padding: 0 32px 80px; }
        .doc-cover { background: #1A1A1A; color: #fff; padding: 64px 32px; margin-bottom: 0; }
        .doc-cover-inner { max-width: 900px; margin: 0 auto; }
        .doc-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #E85239; margin-bottom: 16px; }
        .doc-h1 { font-size: 42px; font-weight: 900; letter-spacing: -2px; line-height: 1.05; color: #fff; margin-bottom: 20px; }
        .doc-subtitle { font-size: 15px; color: #9A9A9A; max-width: 520px; line-height: 1.7; }
        .doc-cover-meta { display: flex; gap: 32px; margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #6B6B6B; }
        .doc-cover-meta span strong { color: #9A9A9A; display: block; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }

        /* TOC */
        .toc-panel { background: #fff; border-bottom: 1px solid var(--border); padding: 40px 32px; }
        .toc-panel-inner { max-width: 900px; margin: 0 auto; }
        .toc-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--brand); margin-bottom: 20px; }
        .toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 40px; }
        .toc-item { font-size: 13px; color: var(--ink-3); padding: 5px 0; border-bottom: 1px dashed var(--border); display: flex; gap: 8px; }
        .toc-item a { color: inherit; text-decoration: none; }
        .toc-item a:hover { color: var(--brand); }
        .toc-num { color: var(--brand); font-weight: 700; min-width: 28px; font-size: 12px; }
        .toc-main { font-weight: 600; color: var(--ink); }
        .toc-sub { padding-left: 28px; font-size: 12px; border-bottom: 1px dotted var(--border); }

        /* Sections */
        .section { padding: 56px 0 0; }
        .section + .section { border-top: 1px solid var(--border); }
        .chapter-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--brand); margin-bottom: 8px; }
        h1.chapter { font-size: 30px; font-weight: 900; color: var(--ink); letter-spacing: -1px; line-height: 1.1; margin: 0 0 12px; }
        .chapter-desc { font-size: 14px; color: var(--ink-3); max-width: 620px; line-height: 1.75; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 2px solid var(--brand-light); }
        h2.sec { font-size: 16px; font-weight: 800; color: var(--ink); margin: 40px 0 14px; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
        h2.sec::before { content: ''; display: inline-block; width: 4px; height: 20px; background: var(--brand); border-radius: 2px; flex-shrink: 0; }
        h3.subsec { font-size: 13px; font-weight: 700; color: var(--ink); margin: 24px 0 10px; }
        p { margin: 0 0 14px; line-height: 1.8; font-size: 14px; }
        ul, ol { padding-left: 22px; margin: 8px 0 16px; }
        li { margin-bottom: 7px; line-height: 1.75; font-size: 14px; }
        li strong { color: var(--ink); }

        /* Table */
        .tbl-wrap { margin: 16px 0 24px; border-radius: 10px; border: 1px solid var(--border); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead tr { background: var(--ink); }
        thead th { padding: 10px 16px; text-align: left; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
        tbody tr:nth-child(even) { background: var(--surface); }
        tbody td { padding: 10px 16px; border-bottom: 1px solid var(--border); vertical-align: top; line-height: 1.65; }
        tbody tr:last-child td { border-bottom: none; }
        td strong { color: var(--ink); font-weight: 700; }

        /* Step list */
        .steps { list-style: none; padding: 0; counter-reset: step; margin: 12px 0 20px; }
        .steps li { counter-increment: step; display: flex; gap: 14px; margin-bottom: 14px; align-items: flex-start; font-size: 14px; }
        .steps li::before { content: counter(step); background: var(--brand); color: #fff; font-size: 10px; font-weight: 800; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }

        /* Callout */
        .callout { background: var(--brand-light); border: 1px solid #f0b4a8; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 13px; color: var(--ink-2); line-height: 1.7; }
        .callout strong { color: #C43A22; }
        .note { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px 16px; margin: 12px 0; font-size: 13px; color: #166534; line-height: 1.7; }

        /* Card grid */
        .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; }
        .card-title { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
        .card-body { font-size: 12.5px; color: var(--ink-3); line-height: 1.65; }

        /* Badge */
        .badge { display: inline-block; padding: 2px 9px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-brand { background: var(--brand-light); color: #C43A22; }
        .badge-green { background: #D1FAE5; color: #065F46; }
        .badge-gray { background: #F3F4F6; color: #374151; }
        .badge-orange { background: #FEF3C7; color: #92400E; }
        .badge-red { background: #FEE2E2; color: #991B1B; }

        /* Intro box */
        .intro-box { background: #fff; border-left: 3px solid var(--brand); padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 14px; color: var(--ink-3); line-height: 1.75; }

        /* Nav */
        .doc-nav { position: sticky; top: 0; z-index: 100; background: rgba(251,249,247,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); padding: 12px 32px; display: flex; align-items: center; justify-content: space-between; }
        .doc-nav-inner { max-width: 900px; width: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .doc-logo { font-size: 15px; font-weight: 900; letter-spacing: -0.5px; color: var(--ink); }
        .doc-logo span { color: var(--brand); }
        .doc-nav-meta { font-size: 11px; color: var(--ink-4); }

        /* Footer */
        .doc-footer { margin-top: 64px; padding: 32px 32px; border-top: 1px solid var(--border); text-align: center; background: #fff; }
        .doc-footer-logo { font-size: 18px; font-weight: 900; letter-spacing: -1px; color: var(--ink); margin-bottom: 8px; }
        .doc-footer-logo span { color: var(--brand); }
        .doc-footer-text { font-size: 12px; color: var(--ink-4); }

        hr.divider { border: none; border-top: 1px solid var(--border); margin: 48px 0; }

        @media (max-width: 700px) {
          .doc-h1 { font-size: 28px; }
          .card-grid { grid-template-columns: 1fr; }
          .toc-grid { grid-template-columns: 1fr; }
          .doc-cover { padding: 40px 24px; }
          .doc-container { padding: 0 20px 60px; }
          .toc-panel { padding: 32px 20px; }
          .doc-nav { padding: 10px 20px; }
        }
      `}</style>

      {/* ── STICKY NAV ── */}
      <nav className="doc-nav">
        <div className="doc-nav-inner">
          <div className="doc-logo">EXECUTA<span>.</span></div>
          <div className="doc-nav-meta">Platform Documentation · v1.0 · Internal</div>
        </div>
      </nav>

      {/* ── COVER ── */}
      <div className="doc-cover">
        <div className="doc-cover-inner">
          <div className="doc-eyebrow">Internal Platform Documentation</div>
          <div className="doc-h1">Features &amp;<br />Functionality<br />Overview</div>
          <div className="doc-subtitle">
            The complete product specification for the Executa platform as of Version 1.0 — covering every feature, flow, and functionality across the Client, Freelancer, and Admin portals.
          </div>
          <div className="doc-cover-meta">
            <span><strong>Version</strong>1.0 Milestone</span>
            <span><strong>Date</strong>June 2026</span>
            <span><strong>Audience</strong>Internal / Business Owner</span>
            <span><strong>Status</strong>Confidential</span>
          </div>
        </div>
      </div>

      {/* ── TOC ── */}
      <div className="toc-panel">
        <div className="toc-panel-inner">
          <div className="toc-title">Table of Contents</div>
          <div className="toc-grid">
            <div>
              <div className="toc-item toc-main"><span className="toc-num">01</span><a href="#s1">What is Executa</a></div>
              <div className="toc-item toc-main"><span className="toc-num">02</span><a href="#s2">How the Platform Works</a></div>
              <div className="toc-item toc-main"><span className="toc-num">03</span><a href="#s3">Client Portal</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.1</span><a href="#s3-1">Landing Page</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.2</span><a href="#s3-2">Project Onboarding</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.3</span><a href="#s3-3">AI Scope Generation</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.4</span><a href="#s3-4">Platform Fee Payment</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.5</span><a href="#s3-5">Client Workspace</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.6</span><a href="#s3-6">Project Detail Page</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.7</span><a href="#s3-7">Scope Review &amp; Approval</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.8</span><a href="#s3-8">Scope Upgrades</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.9</span><a href="#s3-9">Milestone Tracking</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.10</span><a href="#s3-10">In-Project Chat</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.11</span><a href="#s3-11">Raising a Dispute</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.12</span><a href="#s3-12">Projects List</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.13</span><a href="#s3-13">Billing &amp; Finances</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.14</span><a href="#s3-14">Payment Methods</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.15</span><a href="#s3-15">Organization &amp; Team</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.16</span><a href="#s3-16">Client Support</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">3.17</span><a href="#s3-17">Help &amp; Articles</a></div>
            </div>
            <div>
              <div className="toc-item toc-main"><span className="toc-num">04</span><a href="#s4">Freelancer Portal</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.1</span><a href="#s4-1">Registration &amp; Onboarding</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.2</span><a href="#s4-2">Skills Assessment</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.3</span><a href="#s4-3">Freelancer Workspace</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.4</span><a href="#s4-4">Project Discovery</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.5</span><a href="#s4-5">Project Preview</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.6</span><a href="#s4-6">Execution Environment</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.7</span><a href="#s4-7">Scope Upgrade Proposals</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.8</span><a href="#s4-8">Capability Profile</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.9</span><a href="#s4-9">Earnings Dashboard</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.10</span><a href="#s4-10">Profile Management</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">4.11</span><a href="#s4-11">Freelancer Support</a></div>
              <div className="toc-item toc-main"><span className="toc-num">05</span><a href="#s5">Admin Portal</a></div>
              <div className="toc-item toc-sub"><span className="toc-num">5.1–5.9</span><a href="#s5">All Admin Sections</a></div>
              <div className="toc-item toc-main"><span className="toc-num">06</span><a href="#s6">Project Status Lifecycle</a></div>
              <div className="toc-item toc-main"><span className="toc-num">07</span><a href="#s7">Pricing &amp; Fee Structure</a></div>
              <div className="toc-item toc-main"><span className="toc-num">08</span><a href="#s8">Payment System</a></div>
              <div className="toc-item toc-main"><span className="toc-num">09</span><a href="#s9">AI Capabilities</a></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="doc-container">

        {/* ── S1: WHAT IS EXECUTA ── */}
        <div id="s1" className="section">
          <div className="chapter-eyebrow">Section 01</div>
          <h1 className="chapter">What is Executa</h1>
          <div className="chapter-desc">A managed execution platform that connects vetted freelance professionals with businesses that need software or design projects built.</div>

          <div className="intro-box">
            Executa is <strong>not</strong> a marketplace where clients browse profiles and negotiate deals. It is a <strong>structured, managed process</strong> where every project goes through AI scoping, every freelancer is vetted, and platform admins manage the quality and governance of every engagement.
          </div>

          <h3 className="subsec">Three Types of Users</h3>
          <div className="tbl-wrap"><table><thead><tr><th>User Type</th><th>Who They Are</th><th>What They Do</th></tr></thead><tbody>
            <tr><td><strong>Client</strong></td><td>A business or individual hiring talent</td><td>Creates projects, reviews scope, pays platform fee, approves milestones</td></tr>
            <tr><td><strong>Freelancer</strong></td><td>A vetted designer or developer</td><td>Gets assessed, receives invitations, executes project milestones</td></tr>
            <tr><td><strong>Admin</strong></td><td>Executa platform operators</td><td>Manages vetting, assigns freelancers, resolves disputes, controls the platform</td></tr>
          </tbody></table></div>

          <h3 className="subsec">Core Principles</h3>
          <div className="card-grid">
            <div className="card"><div className="card-title">🤖 AI-Powered Scoping</div><div className="card-body">Every project goes through an AI scope discovery engine before any freelancer is involved, eliminating ambiguity and setting clear expectations from the start.</div></div>
            <div className="card"><div className="card-title">✅ Vetting-First Freelancers</div><div className="card-body">Freelancers are evaluated through a rigorous multi-level skills assessment before being eligible for any client project. Every expert is verified.</div></div>
            <div className="card"><div className="card-title">🔒 Escrow &amp; Accountability</div><div className="card-body">Project fees are held in escrow. Accountability and execution fees create structural incentives for timely, quality delivery.</div></div>
            <div className="card"><div className="card-title">🎯 Managed Execution</div><div className="card-body">Admin moderates disputes, scope upgrades, freelancer assignments, and project transitions — so clients never manage contractors alone.</div></div>
          </div>
        </div>

        {/* ── S2: FULL FLOW ── */}
        <div id="s2" className="section">
          <div className="chapter-eyebrow">Section 02</div>
          <h1 className="chapter">How the Platform Works</h1>
          <div className="chapter-desc">The complete end-to-end journey every project takes — from a client's idea to delivered product.</div>
          <ol className="steps">
            <li><div><strong>Client Creates a Project</strong><br/>The client answers 7 structured discovery questions — what to build, who will use it, how it should work, and what success means. Takes 10–15 minutes. No technical knowledge required.</div></li>
            <li><div><strong>AI Generates the Scope</strong><br/>Executa's AI Scope Engine analyses the answers and automatically generates a detailed scope — functional units, effort scores, timeline estimate, revision rules. Happens in seconds.</div></li>
            <li><div><strong>Client Pays Platform Fee</strong><br/>The scope comes with a pricing breakdown. The client reviews and pays the platform fee via PhonePe. This unlocks the project for the matching queue.</div></li>
            <li><div><strong>Admin Assigns a Freelancer</strong><br/>Executa's admin team reviews the project, matches it with a qualified freelancer based on skill level and domain, and sends the invitation.</div></li>
            <li><div><strong>Freelancer Accepts</strong><br/>The freelancer reviews the full project scope and either accepts or declines. Once accepted, work officially begins.</div></li>
            <li><div><strong>Work &amp; Milestones</strong><br/>The freelancer delivers milestone by milestone. The client reviews and approves each one directly in the platform.</div></li>
            <li><div><strong>Scope Upgrades (if needed)</strong><br/>If new features are requested, either party initiates a scope upgrade. Both must approve before additional work begins.</div></li>
            <li><div><strong>Project Completion</strong><br/>When all milestones are approved, the project is marked complete and the freelancer's earnings are cleared from escrow.</div></li>
          </ol>
        </div>

        {/* ── S3: CLIENT PORTAL ── */}
        <div id="s3" className="section">
          <div className="chapter-eyebrow">Section 03</div>
          <h1 className="chapter">Client Portal — Features &amp; Flows</h1>
          <div className="chapter-desc">Everything a client experiences — from discovering the platform to managing projects, billing, and their team.</div>

          <h2 id="s3-1" className="sec">3.1 Landing Page</h2>
          <p>The public-facing page accessible without login. Shows: how the platform works (4-step flow), why Executa differs from marketplaces, how vetting works for freelancers, the transparent pricing model, FAQs, and CTAs ("Start Your Project" / "Join as Expert").</p>

          <h2 id="s3-2" className="sec">3.2 Client Onboarding — Creating a Project</h2>
          <p>A guided 5-step wizard — a structured discovery interview that extracts enough information for AI scope generation. No technical language required.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Step</th><th>Name</th><th>What the Client Fills In</th></tr></thead><tbody>
            <tr><td><strong>Step 1</strong></td><td>Project Foundation</td><td>Project name + Domain choice (Design / Development / Both)</td></tr>
            <tr><td><strong>Step 2</strong></td><td>Project Explanation</td><td>What to build, the problem being solved, who will use it</td></tr>
            <tr><td><strong>Step 3</strong></td><td>Deep Dive</td><td>How the product works (user journey), what it manages, special requirements, definition of success</td></tr>
            <tr><td><strong>Step 4</strong></td><td>Generate Scope</td><td>Review summary → "Analyse &amp; Build Scope" triggers AI</td></tr>
            <tr><td><strong>Step 5</strong></td><td>Unlock Scope</td><td>Payment page (handled next)</td></tr>
          </tbody></table></div>
          <div className="callout"><strong>Key design:</strong> Questions deliberately avoid technical language. The client describes the problem and outcome in plain words — the AI handles the rest.</div>

          <h2 id="s3-3" className="sec">3.3 AI Scope Generation</h2>
          <p>After submitting, an animated loading screen shows the AI working through stages (Analyzing business outcomes → Structuring timeline → Defining functional units → Calculating effort scores → Finalizing scope). Takes ~3–5 seconds.</p>
          <h3 className="subsec">What the AI Produces</h3>
          <ul>
            <li><strong>Project Summary</strong> — AI-written overview, business goal, identified user types</li>
            <li><strong>Functional Units</strong> — every feature/module as its own section with: name, description, included/excluded items, deliverables, effort score across 6 dimensions</li>
            <li><strong>Timeline Estimate</strong> — days or weeks</li>
            <li><strong>Revision Rules</strong> — what counts as a free revision</li>
            <li><strong>Upgrade Rules</strong> — what triggers additional charges</li>
            <li><strong>Expected Deliverables</strong> — the full list of what the client receives</li>
          </ul>

          <h2 id="s3-4" className="sec">3.4 Platform Fee Payment via PhonePe</h2>
          <p>Client reviews itemised pricing (Freelancer Price · Scope Fee · Accountability Fee · Execution Fee · Total) and optionally selects Accountability Mode. Clicking "Pay with PhonePe" initiates the payment flow.</p>
          <ol className="steps">
            <li><div>Client clicks "Pay with PhonePe"</div></li>
            <li><div>Redirected to PhonePe's hosted payment page (UPI, card, net banking supported)</div></li>
            <li><div>Client completes payment on PhonePe</div></li>
            <li><div>Redirected back to Executa's payment success page</div></li>
            <li><div>Executa verifies payment with PhonePe in real time</div></li>
            <li><div>Project moves to "Matching" status — admin now receives it for freelancer assignment</div></li>
            <li><div>Payment instrument auto-saved to client's billing profile</div></li>
          </ol>
          <div className="note">✅ Payment success screen: "Payment Confirmed!" + "Payment method saved to Billing &amp; Finances" badge + auto-redirect to project page after 2 seconds.</div>

          <h2 id="s3-5" className="sec">3.5 Client Workspace — Home Dashboard</h2>
          <div className="tbl-wrap"><table><thead><tr><th>Panel</th><th>What It Shows</th></tr></thead><tbody>
            <tr><td><strong>Attention Required</strong></td><td>Projects needing scope review/approval. Shows "All caught up" when clear.</td></tr>
            <tr><td><strong>Active Projects</strong></td><td>All execution-phase projects. Card shows: project name, assigned freelancer, current phase, progress bar. Click → project detail.</td></tr>
            <tr><td><strong>Upcoming Events</strong></td><td>Active projects with their current phase label.</td></tr>
            <tr><td><strong>Greeting</strong></td><td>Time-aware IST greeting ("Good morning/afternoon/evening, [Name]") + count summary.</td></tr>
          </tbody></table></div>

          <h2 id="s3-6" className="sec">3.6 Project Detail Page</h2>
          <p>Central hub for a single project — scope, freelancer info, milestones, chat, and status all in one place.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Panel</th><th>Contents</th></tr></thead><tbody>
            <tr><td><strong>Project Header</strong></td><td>Title, colour-coded status badge, priority, domain type</td></tr>
            <tr><td><strong>Scope Section</strong></td><td>AI summary, all functional units (expandable), timeline, rules, "Approve Scope" button</td></tr>
            <tr><td><strong>Freelancer Panel</strong></td><td>If assigned: name, specialisation, level. If not: "Awaiting Freelancer Assignment"</td></tr>
            <tr><td><strong>Milestone Panel</strong></td><td>All milestones with status (Pending/Submitted/Approved). Client approves here.</td></tr>
            <tr><td><strong>Chat Panel</strong></td><td>Real-time messaging with assigned freelancer. Full history preserved.</td></tr>
            <tr><td><strong>Dispute Section</strong></td><td>"Raise a Dispute" button — available during active or review status</td></tr>
          </tbody></table></div>

          <h2 id="s3-7" className="sec">3.7 Scope Review &amp; Approval</h2>
          <ol className="steps">
            <li><div>Client is notified on dashboard that scope is ready</div></li>
            <li><div>Client reads all functional units, deliverables, and timeline</div></li>
            <li><div>Client can add custom functional units (features the AI missed)</div></li>
            <li><div>Client clicks "Approve Scope" → project moves to payment step</div></li>
          </ol>
          <div className="callout"><strong>Why this matters:</strong> The approved scope becomes the binding definition of what gets built. Everything outside triggers the formal upgrade process.</div>

          <h2 id="s3-8" className="sec">3.8 Scope Upgrades</h2>
          <ol className="steps">
            <li><div>Either party proposes an upgrade — with name, description, and justification</div></li>
            <li><div>Freelancer reviews and approves first (assesses feasibility and effort/cost impact)</div></li>
            <li><div>Client reviews the effort increase and cost increase (₹) and approves or rejects</div></li>
            <li><div>Once both approve, new feature is added to scope and price is updated</div></li>
          </ol>

          <h2 id="s3-9" className="sec">3.9 Milestone Tracking</h2>
          <div className="tbl-wrap"><table><thead><tr><th>Status</th><th>Meaning</th></tr></thead><tbody>
            <tr><td><span className="badge badge-gray">Pending</span></td><td>Work not yet submitted by the freelancer</td></tr>
            <tr><td><span className="badge badge-orange">Submitted</span></td><td>Freelancer has submitted; awaiting client review</td></tr>
            <tr><td><span className="badge badge-green">Approved</span></td><td>Client accepted this deliverable — permanently marked complete</td></tr>
          </tbody></table></div>

          <h2 id="s3-10" className="sec">3.10 In-Project Chat</h2>
          <p>Direct messaging between client and assigned freelancer — project-scoped. Full history preserved. Real-time send/receive. Every project has its own isolated conversation.</p>

          <h2 id="s3-11" className="sec">3.11 Raising a Dispute</h2>
          <p>Formal escalation when client and freelancer cannot resolve disagreement. Available during active execution or review. Admin is notified instantly, reviews both sides, and resolves in favour of either party. Project resumes or is cancelled based on resolution.</p>

          <h2 id="s3-12" className="sec">3.12 Projects List</h2>
          <p>All client projects in one place. Filter tabs: All / Active / Completed / Pending. Each card shows name, status badge, domain, price, creation date. Includes "Create New Project" button.</p>

          <h2 id="s3-13" className="sec">3.13 Billing &amp; Finances</h2>
          <p><strong>Active Escrow Holdings</strong> — Only projects where a freelancer is actively assigned and work has started. Shows escrow amount + expandable pricing breakdown per project.</p>
          <p><strong>Platform Fee Payments History</strong> — Table of every successful PhonePe payment. Columns: Date | Project | Amount | Status | Receipt button.</p>
          <p><strong>Summary Stats Card</strong> — Total Platform Fees Paid (headline) · Projects Completed · Active Escrow value · Total Scopes Paid.</p>

          <h2 id="s3-14" className="sec">3.14 Payment Methods Management</h2>
          <p>Auto-saved on first successful PhonePe payment. Manual addition via "+ Add Payment Method" modal.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Type</th><th>What's Entered</th></tr></thead><tbody>
            <tr><td><strong>UPI</strong></td><td>UPI ID (e.g. name@okicici, name@ybl, name@paytm). Format hints shown. Consent required.</td></tr>
            <tr><td><strong>Credit/Debit Card</strong></td><td>Card number (auto-formats), expiry MM/YY, cardholder name. Brand auto-detected: VISA / Mastercard / RuPay / Amex. Consent required.</td></tr>
            <tr><td><strong>Net Banking</strong></td><td>Bank dropdown (HDFC, ICICI, SBI, Axis, Kotak, PNB, BOB, Canara, IDFC FIRST, Yes, IndusInd, Federal). Account holder name. Consent required.</td></tr>
          </tbody></table></div>
          <div className="callout"><strong>Consent:</strong> "By saving, I authorise Executa to store this payment method and use it to fund project escrow on my behalf. My financial data is encrypted and never shared."</div>

          <h2 id="s3-15" className="sec">3.15 Organization &amp; Team</h2>
          <div className="tbl-wrap"><table><thead><tr><th>Section</th><th>Features</th></tr></thead><tbody>
            <tr><td><strong>Company Profile</strong></td><td>Workspace name (editable), industry (editable), current plan (Standard). Edit/Save toggle.</td></tr>
            <tr><td><strong>Team Members</strong></td><td>Account owner shown with name, email, "Owner" badge. "Invite Member" button.</td></tr>
            <tr><td><strong>Invite Member</strong></td><td>Email + role selection: Admin (full access) / Member (projects only) / Viewer (read-only). Send Invite button.</td></tr>
          </tbody></table></div>

          <h2 id="s3-16" className="sec">3.16 Client Support</h2>
          <p>In-app support chat connecting client directly to Executa's support team (admin). Full conversation history preserved. Marked open or resolved by admin. Available at all times.</p>

          <h2 id="s3-17" className="sec">3.17 Help &amp; Articles</h2>
          <p>Built-in knowledge base covering: platform overview &amp; FAQ, how scoping works, creating a project, pricing model, escrow and payments, project statuses, milestone management, and raising disputes.</p>
        </div>

        {/* ── S4: FREELANCER PORTAL ── */}
        <div id="s4" className="section">
          <div className="chapter-eyebrow">Section 04</div>
          <h1 className="chapter">Freelancer Portal — Features &amp; Flows</h1>
          <div className="chapter-desc">Everything a freelancer experiences — from registering and being vetted to managing projects, tracking earnings, and building their verified skill profile.</div>

          <h2 id="s4-1" className="sec">4.1 Freelancer Registration &amp; Onboarding</h2>
          <p>A structured 4-step profile setup every freelancer completes once before being eligible for any project.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Step</th><th>Name</th><th>What Happens</th></tr></thead><tbody>
            <tr><td><strong>Step 1</strong></td><td>Primary Field</td><td>Choose: <strong>Development</strong> or <strong>Design</strong>. Determines the skill evaluation track.</td></tr>
            <tr><td><strong>Step 2</strong></td><td>Domain Selection</td><td>Choose one or more domains within their field (multi-select)</td></tr>
            <tr><td><strong>Step 3</strong></td><td>Specialisations</td><td>Pick specific skills within selected domains to be evaluated on (multi-select)</td></tr>
            <tr><td><strong>Step 4</strong></td><td>Bio &amp; Confirmation</td><td>Optional bio + "Generate custom vetting test" → AI creates assessment</td></tr>
          </tbody></table></div>

          <h3 className="subsec">Development Domains &amp; Specialisations</h3>
          <div className="tbl-wrap"><table><thead><tr><th>Domain</th><th>Example Specialisations</th></tr></thead><tbody>
            <tr><td><strong>Frontend Development</strong></td><td>Component Architecture, Responsive Systems, State Management, Rendering Optimisation, Accessibility, Reusable UI Systems, Routing Architecture, Design System Integration, Frontend Scalability, Error State Handling, API Consumption, Loading State Logic</td></tr>
            <tr><td><strong>Backend Development</strong></td><td>API Architecture, Authentication Systems, Database Design, Role-based Access, Scalability Thinking, Error Recovery, Queue Systems, Security Handling, Data Relationships, Caching Strategy, Service Architecture</td></tr>
            <tr><td><strong>Full Stack</strong></td><td>System Integration, Frontend-Backend Coordination, Data Flow Design, Multi-role Architecture, Realtime System Thinking, Deployment Logic</td></tr>
            <tr><td><strong>Mobile Development</strong></td><td>Cross-platform Architecture, Offline-first Thinking, Mobile Performance, Native Interaction Patterns, Gesture Systems, Mobile Scalability</td></tr>
            <tr><td><strong>CMS / No-Code</strong></td><td>Template Architecture, Dynamic Content Systems, CMS Logic, Reusable Sections, Ecommerce Workflows, SEO Structure</td></tr>
            <tr><td><strong>DevOps &amp; Infrastructure</strong></td><td>CI/CD Systems, Infrastructure Scaling, Deployment Automation, Monitoring Systems, Failover Handling, Cloud Architecture</td></tr>
            <tr><td><strong>Data &amp; AI</strong></td><td>AI Workflow Design, Automation Thinking, Data Pipeline Thinking, ML System Understanding, API Integration Logic, AI Product Thinking</td></tr>
          </tbody></table></div>

          <h3 className="subsec">Design Domains &amp; Specialisations</h3>
          <div className="tbl-wrap"><table><thead><tr><th>Domain</th><th>Example Specialisations</th></tr></thead><tbody>
            <tr><td><strong>UI/UX Design</strong></td><td>UX Writing, UX Strategy, Mobile UX, Information Architecture, User Flow Design, Interaction Design, Design Systems, Accessibility Thinking, Responsive UX, UX Research Thinking, Conversion UX, Dashboard UX, Onboarding Experience Design, Product Thinking</td></tr>
            <tr><td><strong>Graphic Design</strong></td><td>Visual Hierarchy, Typography Systems, Layout Composition, Marketing Design Thinking, Ad Creative Thinking, Brand Consistency, Social Media Adaptation, Print Adaptation, Color Psychology</td></tr>
            <tr><td><strong>Branding &amp; Identity</strong></td><td>Logo Systems, Brand Architecture, Typography Identity, Brand Scalability, Packaging Direction, Visual Language Development, Brand Storytelling, Multi-platform Consistency</td></tr>
            <tr><td><strong>Motion &amp; Video Design</strong></td><td>Motion Timing, Narrative Thinking, Transition Logic, UI Motion, Editing Rhythm, Visual Pacing, Platform Adaptation</td></tr>
            <tr><td><strong>Product Design</strong></td><td>Systems Thinking, Product Strategy, User Journey Thinking, Scalability UX, Data-heavy UX, Operational UX, Multi-role Systems</td></tr>
          </tbody></table></div>

          <h2 id="s4-2" className="sec">4.2 Skills Assessment (Vetting Test)</h2>
          <p>The core quality gate of the platform. Every freelancer must pass before being eligible for any client project.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Stage</th><th>What It Means</th></tr></thead><tbody>
            <tr><td><span className="badge badge-gray">Assigned</span></td><td>Custom AI-generated test brief has been created and sent</td></tr>
            <tr><td><span className="badge badge-orange">In Progress</span></td><td>Freelancer is actively working on the offline task</td></tr>
            <tr><td><span className="badge badge-brand">Submitted</span></td><td>Freelancer submitted their work link for review</td></tr>
            <tr><td><span className="badge badge-orange">Under Review</span></td><td>Admin is evaluating the submission</td></tr>
            <tr><td><span className="badge badge-green">Evaluated</span></td><td>Score and verified level assigned</td></tr>
          </tbody></table></div>
          <ol className="steps">
            <li><div>AI generates a <strong>custom task</strong> tailored to chosen skills — not generic</div></li>
            <li><div>Freelancer reviews task brief (requirements + evaluation criteria)</div></li>
            <li><div>Task completed <strong>offline</strong> in own environment. AI tools permitted — output quality evaluated</div></li>
            <li><div>Freelancer submits work link (GitHub, Figma, live URL, etc.) + optional notes</div></li>
            <li><div>Admin scores across multiple dimensions → confirms verified level (1, 2, or 3)</div></li>
          </ol>
          <div className="tbl-wrap"><table><thead><tr><th>Level</th><th>Label</th><th>What It Means</th></tr></thead><tbody>
            <tr><td><span className="badge badge-gray">Level 1</span></td><td>Foundational</td><td>Junior, solid fundamentals</td></tr>
            <tr><td><span className="badge badge-brand">Level 2</span></td><td>Professional</td><td>Mid-level, commercially experienced</td></tr>
            <tr><td><span className="badge badge-green">Level 3</span></td><td>Senior Expert</td><td>Senior/principal, complex problem solving</td></tr>
          </tbody></table></div>

          <h2 id="s4-3" className="sec">4.3 Freelancer Workspace — Home Dashboard</h2>
          <div className="tbl-wrap"><table><thead><tr><th>Panel</th><th>What It Shows</th></tr></thead><tbody>
            <tr><td><strong>Active Projects</strong></td><td>All execution-phase projects. Clicking opens the full execution environment.</td></tr>
            <tr><td><strong>Assessment Banner</strong></td><td>Test in progress: prompt to go to Skills section. Test under review: status indicator.</td></tr>
            <tr><td><strong>Scope Upgrades Alert</strong></td><td>Orange alert if any upgrades need freelancer approval. "Review &amp; Approve" opens detail modal.</td></tr>
            <tr><td><strong>Action Required Card</strong></td><td>Count of pending project invitations. Link to Projects.</td></tr>
            <tr><td><strong>Cleared Revenue Card</strong></td><td>Total lifetime earnings in ₹. Link to Earnings.</td></tr>
          </tbody></table></div>

          <h2 id="s4-4" className="sec">4.4 Project Discovery &amp; Invitations</h2>
          <div className="tbl-wrap"><table><thead><tr><th>Tab</th><th>Contents</th></tr></thead><tbody>
            <tr><td><strong>Pending Invitations</strong></td><td>Projects where admin assigned this freelancer but they haven't responded. Shows: project title, client industry, domain, level required, timeline, earnings, Preview Scope link, Accept/Decline buttons.</td></tr>
            <tr><td><strong>Active</strong></td><td>Projects accepted and in execution.</td></tr>
            <tr><td><strong>Completed</strong></td><td>All finished projects.</td></tr>
          </tbody></table></div>

          <h2 id="s4-5" className="sec">4.5 Project Preview Before Accepting</h2>
          <p>Full scope document visible before accepting — all functional units, deliverables, timeline, required skills, revision/upgrade rules, and earnings breakdown. Enables fully informed acceptance decisions.</p>

          <h2 id="s4-6" className="sec">4.6 Execution Environment</h2>
          <div className="tbl-wrap"><table><thead><tr><th>Section</th><th>Features</th></tr></thead><tbody>
            <tr><td><strong>Project Overview</strong></td><td>Project name, client name, domain, priority, deadline, status badge</td></tr>
            <tr><td><strong>Milestone Tracker</strong></td><td>All milestones with due dates. "Submit Deliverable" per milestone → form for URL + notes. Approved = permanent green checkmark.</td></tr>
            <tr><td><strong>Scope Reference</strong></td><td>All functional units always accessible while working. Revision + upgrade rules shown.</td></tr>
            <tr><td><strong>Chat with Client</strong></td><td>Same conversation the client sees, sender/receiver roles visually swapped.</td></tr>
          </tbody></table></div>

          <h2 id="s4-7" className="sec">4.7 Scope Upgrade Proposals</h2>
          <p>When a freelancer discovers something that needs building but wasn't in scope: they propose via form (name, description, justification, estimated effort). Admin and client are notified. If client approves, feature is added and pricing updated.</p>

          <h2 id="s4-8" className="sec">4.8 Capability Profile &amp; Skill Tiers</h2>
          <ul>
            <li><strong>Level Badge</strong> — prominent verified level (1, 2, or 3) with label</li>
            <li><strong>Verified Specialisations</strong> — all passed skill tags as coloured pills with score</li>
            <li><strong>Assessment Status</strong> — current test state with action buttons</li>
            <li><strong>"Add Specialist Skill"</strong> — triggers new onboarding + assessment for additional skills</li>
          </ul>

          <h2 id="s4-9" className="sec">4.9 Earnings Dashboard</h2>
          <p><strong>Summary:</strong> Total cleared revenue (lifetime), projects completed, average project value.</p>
          <p><strong>History Table:</strong> Project Name | Completion Date | Amount Earned | Status (Cleared / Pending)</p>

          <h2 id="s4-10" className="sec">4.10 Freelancer Profile Management</h2>
          <ul>
            <li><strong>Profile Photo</strong> — click circular avatar to upload. Camera icon on hover.</li>
            <li><strong>Full Name</strong> and <strong>Email Address</strong> — both editable inline</li>
            <li><strong>Professional Biography</strong> — free-form text visible to clients and admin</li>
            <li><strong>Verified Specialisations</strong> — read-only here (managed via Capability)</li>
            <li><strong>Sign Out</strong> — cleanly terminates the active session</li>
          </ul>

          <h2 id="s4-11" className="sec">4.11 Freelancer Support</h2>
          <p>Direct in-app support chat with Executa's support team. Connects to admin inbox. Conversations marked open or resolved by admin.</p>
        </div>

        {/* ── S5: ADMIN PORTAL ── */}
        <div id="s5" className="section">
          <div className="chapter-eyebrow">Section 05</div>
          <h1 className="chapter">Admin Portal — Features &amp; Flows</h1>
          <div className="chapter-desc">The platform governance layer — where Executa operators manage quality, assignments, disputes, and platform health.</div>

          <h2 className="sec">5.1 Admin Login</h2>
          <p>Separate password-protected login page for platform operators. Not connected to client/freelancer auth. Sets a secure session cookie verified on every admin page. Auto-redirects to login if missing.</p>

          <h2 className="sec">5.2 Platform Overview Dashboard</h2>
          <div className="card-grid">
            <div className="card"><div className="card-title">Platform Metrics</div><div className="card-body">Total freelancers · Total clients · Total projects · Active projects · Platform revenue (total fees collected)</div></div>
            <div className="card"><div className="card-title">Alert Indicators</div><div className="card-body">Pending test reviews badge · Disputed projects alert (shown when disputes are active)</div></div>
          </div>

          <h2 className="sec">5.3 Test Review &amp; Scoring</h2>
          <p>The queue where admin evaluates freelancer assessment submissions — the quality gate that determines platform entry.</p>
          <ul>
            <li>Shows: freelancer name/email, specialisations tested, submission link, notes</li>
            <li>Admin opens submission URL, reviews actual work, assigns overall score (0–100) + per-dimension scores + feedback notes</li>
            <li>Clicks "Approve" (pass) or "Reject" (fail)</li>
            <li>On Approval: verified level set, specialisations confirmed, freelancer eligible for projects</li>
          </ul>

          <h2 className="sec">5.4 Freelancer Management</h2>
          <p>Complete list of all registered freelancers: name, email, field, domains, verified level badge, onboarding status, test status. Admin can view profile, access test history, assign to project.</p>

          <h2 className="sec">5.5 Client Management</h2>
          <p>Complete list of all clients: name, email, projects count, total platform fees paid. Admin can view all projects, initiate a project on client's behalf.</p>

          <h2 className="sec">5.6 Project Management &amp; Freelancer Assignment</h2>
          <p><strong>Table columns:</strong> Project Title · Client Name · Status · Domain · Level Required · Freelancer Assigned · Total Value (₹) · Creation Date</p>
          <h3 className="subsec">Key Action — Assigning a Freelancer</h3>
          <ol className="steps">
            <li><div>Admin clicks "Assign Freelancer" on a Matching-status project</div></li>
            <li><div>Modal opens showing eligible freelancers — auto-filtered by field match AND sufficient level (≥ required level)</div></li>
            <li><div>Admin selects best candidate and confirms</div></li>
            <li><div>Project moves to "Pending" — freelancer receives invitation</div></li>
          </ol>
          <p><strong>Other admin actions per project:</strong> Change Status · View Scope · View Chat · Raise or Resolve Dispute</p>

          <h2 className="sec">5.7 Dispute Resolution</h2>
          <p>Dedicated view of all "Disputed" projects. Shows full context, dispute details, full conversation history, project timeline. Admin resolves in favour of client or freelancer with resolution notes. Project resumes or is cancelled.</p>

          <h2 className="sec">5.8 Feature Controls</h2>
          <p>On/off switches to enable or disable platform features without code changes.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Feature Flag</th><th>What It Controls</th></tr></thead><tbody>
            <tr><td><strong>AI Scope Enabled</strong></td><td>Whether AI scope generation runs on client onboarding submission</td></tr>
            <tr><td><strong>Payments Enabled</strong></td><td>Whether clients can initiate PhonePe payments</td></tr>
            <tr><td><strong>Freelancer Invitations Enabled</strong></td><td>Whether freelancers can receive and accept project invitations</td></tr>
            <tr><td><strong>Scope Upgrades Enabled</strong></td><td>Whether scope upgrade requests can be submitted by either party</td></tr>
          </tbody></table></div>
          <div className="callout"><strong>Use case:</strong> If there's a payment outage or AI issue, admin can disable that feature instantly without touching any code.</div>

          <h2 className="sec">5.9 Support Inbox</h2>
          <p>Admin's central inbox for all support conversations from clients and freelancers. Shows user name, role, last message preview, and status (open/resolved). Admin replies directly; user sees response immediately. "Mark as Resolved" closes conversation.</p>
        </div>

        {/* ── S6: STATUS LIFECYCLE ── */}
        <div id="s6" className="section">
          <div className="chapter-eyebrow">Section 06</div>
          <h1 className="chapter">Project Status Lifecycle</h1>
          <div className="chapter-desc">Every project moves through a defined set of statuses — and it's always clear who is responsible for the next action.</div>
          <div className="tbl-wrap"><table><thead><tr><th>Status</th><th>What It Means</th><th>Who Moves It Forward</th></tr></thead><tbody>
            <tr><td><span className="badge badge-gray">Scoping</span></td><td>AI is generating the scope</td><td>System — automatic after form submit</td></tr>
            <tr><td><span className="badge badge-brand">Scope Review</span></td><td>Client must review and approve the scope</td><td>Client approves → Pricing</td></tr>
            <tr><td><span className="badge badge-orange">Pricing</span></td><td>Scope confirmed; awaiting platform fee payment</td><td>Client pays → Matching</td></tr>
            <tr><td><span className="badge badge-orange">Matching</span></td><td>Admin finding the right freelancer</td><td>Admin assigns → Pending</td></tr>
            <tr><td><span className="badge badge-orange">Pending</span></td><td>Freelancer invited but hasn't responded</td><td>Freelancer accepts → Active</td></tr>
            <tr><td><span className="badge badge-green">Active</span></td><td>Work in progress — milestones being delivered</td><td>All milestones done → Review</td></tr>
            <tr><td><span className="badge badge-brand">Review</span></td><td>Final deliverable under client evaluation</td><td>Client approves → Completed</td></tr>
            <tr><td><span className="badge badge-green">Completed</span></td><td>Project successfully delivered and accepted</td><td>—</td></tr>
            <tr><td><span className="badge badge-red">Disputed</span></td><td>A dispute has been raised</td><td>Admin resolution → Completed or Cancelled</td></tr>
            <tr><td><span className="badge badge-gray">Cancelled</span></td><td>Project was stopped</td><td>Admin</td></tr>
          </tbody></table></div>
        </div>

        {/* ── S7: PRICING ── */}
        <div id="s7" className="section">
          <div className="chapter-eyebrow">Section 07</div>
          <h1 className="chapter">Pricing &amp; Fee Structure</h1>
          <div className="chapter-desc">Transparent, effort-based pricing calculated automatically from the scope. No hidden fees, no negotiation.</div>

          <h3 className="subsec">Effort Score Dimensions (each feature rated 1–10)</h3>
          <div className="tbl-wrap"><table><thead><tr><th>Dimension</th><th>What It Measures</th></tr></thead><tbody>
            <tr><td><strong>Logic Depth</strong></td><td>How complex the business logic is</td></tr>
            <tr><td><strong>Interaction Density</strong></td><td>How many user interactions are involved</td></tr>
            <tr><td><strong>Data Handling</strong></td><td>How complex the data is to manage</td></tr>
            <tr><td><strong>Dependency Level</strong></td><td>How many external services or dependencies exist</td></tr>
            <tr><td><strong>Variations</strong></td><td>How many states, edge cases, or variants exist</td></tr>
            <tr><td><strong>Output Expectation</strong></td><td>How high the quality bar is for the output</td></tr>
          </tbody></table></div>

          <h3 className="subsec">Fee Breakdown</h3>
          <div className="tbl-wrap"><table><thead><tr><th>Fee Component</th><th>Who It Goes To</th><th>How Calculated</th></tr></thead><tbody>
            <tr><td><strong>Freelancer Price</strong></td><td>The freelancer (via escrow)</td><td>Effort Score × Rate Per Point</td></tr>
            <tr><td><strong>Scope Fee</strong></td><td>Executa</td><td>Flat fee for AI scoping service</td></tr>
            <tr><td><strong>Accountability Fee</strong></td><td>Executa</td><td>10% of Freelancer Price (Accountability Mode only)</td></tr>
            <tr><td><strong>Execution Fee</strong></td><td>Executa</td><td>5% of Freelancer Price</td></tr>
            <tr><td><strong>Total</strong></td><td>Sum of all above</td><td>—</td></tr>
          </tbody></table></div>
          <div className="callout"><strong>Important:</strong> Client pays only the Platform Fee (Scope + Accountability + Execution) at scope creation. The Freelancer Price is held in escrow and released only on project completion.</div>
        </div>

        {/* ── S8: PAYMENT ── */}
        <div id="s8" className="section">
          <div className="chapter-eyebrow">Section 08</div>
          <h1 className="chapter">Payment System</h1>
          <div className="chapter-desc">Executa uses PhonePe — one of India's largest and most trusted payment platforms.</div>

          <div className="card-grid">
            <div className="card"><div className="card-title">UPI</div><div className="card-body">GPay, PhonePe, Paytm, and any UPI app.</div></div>
            <div className="card"><div className="card-title">Credit &amp; Debit Cards</div><div className="card-body">Visa, Mastercard, RuPay, and Amex.</div></div>
            <div className="card"><div className="card-title">Net Banking</div><div className="card-body">Direct bank transfer from all major Indian banks.</div></div>
            <div className="card"><div className="card-title">Wallets</div><div className="card-body">Supported through PhonePe's hosted payment interface.</div></div>
          </div>

          <p><strong>Security:</strong> All processing on PhonePe's infrastructure. Executa stores no sensitive financial data — only reference identifiers and instrument type for billing display.</p>
          <p><strong>Auto-Capture:</strong> On successful payment, the instrument type is auto-detected and saved to the client's billing profile.</p>
        </div>

        {/* ── S9: AI ── */}
        <div id="s9" className="section">
          <div className="chapter-eyebrow">Section 09</div>
          <h1 className="chapter">AI Capabilities</h1>
          <div className="chapter-desc">Executa uses Google Gemini AI for two core functions that power the platform's core value proposition.</div>

          <h2 className="sec">9.1 AI Scope Generation</h2>
          <p>Converts a client's plain-language project description into a structured, professional scope document — in seconds.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody>
            <tr><td>7 discovery questions from onboarding</td><td>Written project summary + all features as functional units + effort scores + timeline + revision rules + upgrade rules + deliverables list + required freelancer capabilities</td></tr>
          </tbody></table></div>
          <div className="callout"><strong>Why it matters:</strong> This eliminates the most common failure point in freelance projects — unclear, ambiguous requirements. Every Executa project starts with a professional scope regardless of client's technical knowledge.</div>

          <h2 id="s9-2" className="sec">9.2 AI Vetting Test Generation</h2>
          <p>Creates a custom skills assessment task for each freelancer, tailored to their specific chosen specialisations.</p>
          <div className="tbl-wrap"><table><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody>
            <tr><td>Freelancer's field, domain(s), and chosen specialisations</td><td>A detailed task brief specific to declared skills, with clear requirements and objective evaluation criteria</td></tr>
          </tbody></table></div>
          <div className="callout"><strong>Why it matters:</strong> A frontend developer specialising in "State Management" receives a completely different test than one specialising in "Accessibility" — even though both are frontend developers. This precision makes the vetting system far more meaningful than any generic assessment.</div>
        </div>

        {/* FOOTER */}
        <div className="doc-footer">
          <div className="doc-footer-logo">EXECUTA<span>.</span></div>
          <div className="doc-footer-text">
            Platform Features &amp; Functionality Document · Version 1.0 · June 2026<br />
            Internal Document · Restricted Access · Confidential
          </div>
        </div>
      </div>
    </div>
  );
}
