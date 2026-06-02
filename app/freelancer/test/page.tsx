"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { ArrowLeft, FileDown, CheckCircle, Info } from "lucide-react";

export default function FreelancerTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const testId = searchParams.get("id");
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retesting, setRetesting] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [allTests, setAllTests] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/freelancer/test${testId ? `?id=${testId}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.test) {
          setTest(data.test);
          if (data.test.submissionUrl) setSubmissionUrl(data.test.submissionUrl);
          if (data.test.submissionNotes) setSubmissionNotes(data.test.submissionNotes);
        } else {
          setError("No assignment found. Please complete onboarding first.");
        }
        if (data.tests) {
          setAllTests(data.tests);
        }
      })
      .catch(() => setError("Failed to load assignment details."))
      .finally(() => setLoading(false));
  }, [testId]);

  async function handleStartTest() {
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/freelancer/test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" })
      });
      if (!res.ok) {
        throw new Error("Failed to start assignment");
      }
      const data = await res.json();
      setTest(data.test);
      router.push("/freelancer/capability");
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setStarting(false);
    }
  }

  async function handleRetest() {
    if (!test) return;
    setRetesting(true);
    setError("");
    try {
      const res = await fetch("/api/freelancer/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          field: test.field, 
          domain: test.domain, 
          specialization: test.specialization 
        })
      });
      if (!res.ok) {
        throw new Error("Failed to generate a new test. You may already have an active test.");
      }
      const data = await res.json();
      router.push(`/freelancer/test?id=${data.testId}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setRetesting(false);
    }
  }

  async function handleSubmitTest() {
    if (!submissionUrl) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/freelancer/test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", submissionUrl, submissionNotes })
      });
      if (!res.ok) {
        throw new Error("Failed to submit assignment");
      }
      const data = await res.json();
      setTest(data.test);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleDownloadPDF = async () => {
    if (!test) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxContentWidth = pageWidth - 2 * margin;
      let currentY = 20;

      const addNewPageIfNeeded = (heightNeeded: number) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (currentY + heightNeeded > pageHeight - margin) {
          doc.addPage();
          currentY = 25;
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(160, 160, 160);
          doc.text("EXECUTA. SKILLS ASSESSMENT", margin, 15);
          doc.setDrawColor(240, 240, 240);
          doc.line(margin, 17, pageWidth - margin, 17);
        }
      };

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("EXECUTA.", margin, currentY);

      // Executa Brand Orange line
      currentY += 4;
      doc.setDrawColor(232, 82, 57); // Brand orange #E85239
      doc.setLineWidth(1);
      doc.line(margin, currentY, margin + 20, currentY);
      
      currentY += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("OFFICIAL ASSESSMENT BRIEF", margin, currentY);

      const badgeText = `LEVEL 2 ASSESSMENT - ${test.specialization || "SPECIALIST"}`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(232, 82, 57); // Brand orange #E85239
      doc.text(badgeText.toUpperCase(), pageWidth - margin - doc.getTextWidth(badgeText), currentY);

      currentY += 4;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);

      // Project Title
      currentY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      const titleText = test.taskPrompt || "Detailed Assignment";
      const titleLines = doc.splitTextToSize(titleText, maxContentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 6);

      // Step 1: About the Project
      if (test.projectContext) {
        currentY += 8;
        addNewPageIfNeeded(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(232, 82, 57); // Brand orange
        doc.text("STEP 1: ABOUT THE PROJECT", margin, currentY);
        currentY += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const contextLines = doc.splitTextToSize(test.projectContext, maxContentWidth);
        doc.text(contextLines, margin, currentY, { align: "justify", maxWidth: maxContentWidth, lineHeightFactor: 1.4 });
        currentY += (contextLines.length * 5) + 4;
      }

      // Step 2: The Problem
      if (test.businessProblem) {
        currentY += 4;
        addNewPageIfNeeded(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(232, 82, 57); // Brand orange
        doc.text("STEP 2: THE PROBLEM", margin, currentY);
        currentY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const problemLines = doc.splitTextToSize(test.businessProblem, maxContentWidth);
        doc.text(problemLines, margin, currentY, { align: "justify", maxWidth: maxContentWidth, lineHeightFactor: 1.4 });
        currentY += (problemLines.length * 5) + 4;
      }

      // Step 3: Requirements
      if (test.taskRequirements && test.taskRequirements.length > 0) {
        currentY += 4;
        addNewPageIfNeeded(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(232, 82, 57); // Brand orange
        doc.text("STEP 3: REQUIREMENTS", margin, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        
        test.taskRequirements.forEach((req: string, i: number) => {
          const itemText = `${i + 1}. ${req}`;
          const itemLines = doc.splitTextToSize(itemText, maxContentWidth - 6);
          addNewPageIfNeeded(itemLines.length * 5 + 2);
          
          doc.text(itemLines, margin, currentY, { lineHeightFactor: 1.3 });
          currentY += (itemLines.length * 5) + 2;
        });
        currentY += 4;
      }

      // Step 4: Rules & Limits
      if (test.constraints && test.constraints.length > 0) {
        currentY += 4;
        addNewPageIfNeeded(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(232, 82, 57); // Brand orange
        doc.text("STEP 4: RULES & LIMITS", margin, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);

        test.constraints.forEach((c: string, i: number) => {
          const itemText = `•  ${c}`;
          const itemLines = doc.splitTextToSize(itemText, maxContentWidth - 6);
          addNewPageIfNeeded(itemLines.length * 5 + 2);

          doc.text(itemLines, margin, currentY, { lineHeightFactor: 1.3 });
          currentY += (itemLines.length * 5) + 2;
        });
        currentY += 4;
      }

      // Step 5: Deliverables
      if (test.deliverables && test.deliverables.length > 0) {
        currentY += 4;
        addNewPageIfNeeded(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(232, 82, 57); // Brand orange
        doc.text("STEP 5: DELIVERABLES", margin, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);

        test.deliverables.forEach((d: string, i: number) => {
          const itemText = `[ ]  ${d}`;
          const itemLines = doc.splitTextToSize(itemText, maxContentWidth - 6);
          addNewPageIfNeeded(itemLines.length * 5 + 2);

          doc.text(itemLines, margin, currentY, { lineHeightFactor: 1.3 });
          currentY += (itemLines.length * 5) + 2;
        });
        currentY += 4;
      }

      // Footer
      addNewPageIfNeeded(20);
      currentY += 8;
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      
      currentY += 6;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Confidential Brief. Generated dynamically for verification on Executa.", margin, currentY);

      doc.save(`Executa_Assessment_${test.specialization || "Brief"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="h-64 max-w-4xl w-full bg-white/50 animate-pulse rounded-2xl border border-border/60" />
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="text-error mb-4 font-medium">{error}</div>
        <Button variant="primary" onClick={() => router.push("/freelancer/workspace")}>
          Go to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Simple Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          {test?.status !== "assigned" ? (
            <button 
              onClick={() => router.push(source === 'capability' ? '/freelancer/capability' : '/freelancer/workspace')}
              className="flex items-center gap-2 text-sm font-semibold text-text-tertiary hover:text-[#E85239] transition-colors py-1.5"
            >
              <ArrowLeft size={16} /> {source === 'capability' ? "Back to Skills Profile" : "Back to Dashboard"}
            </button>
          ) : (
            <div />
          )}
          
          <div className="flex items-center gap-2 px-3 py-1 bg-[#FCE1DC]/30 border border-[#E85239]/20 rounded-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85239]">Level 2 Assessment</span>
          </div>
        </div>

        {/* Short, Clean Heading */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">
            Skills Assessment
          </h1>
          <p className="text-text-secondary text-sm max-w-xl">
            Please review the details below. You can download the assignment brief to complete it offline, and submit your link here when ready.
          </p>
        </div>

        {/* Linear Vertical Stack of Beautiful Cards */}
        <div className="space-y-8 mb-12">
          
          {/* Main Card: Title & Project Scope */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#E85239] uppercase tracking-widest bg-[#FCE1DC]/30 px-3 py-1.5 rounded-full">
                Assigned Project
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight mt-4">
                {test.taskPrompt || "Assessment Project"}
              </h2>
            </div>
            
            <div className="pt-4 border-t border-border/30">
              <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">
                Assessed Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {test.specializations?.map((spec: string, i: number) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FCE1DC]/20 border border-[#E85239]/10 text-[#E85239]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 1: About the Project */}
          {test.projectContext && (
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-bold text-[#E85239] uppercase tracking-wider">
                Step 1: About the Project
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {test.projectContext}
              </p>
            </div>
          )}

          {/* Step 2: The Problem */}
          {test.businessProblem && (
            <div className="bg-white rounded-2xl border border-border/60 shadow-[0_4px_20px_-4px_rgba(232,82,57,0.06)] p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-bold text-[#E85239] uppercase tracking-wider">
                Step 2: The Problem
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {test.businessProblem}
              </p>
            </div>
          )}

          {/* Step 3: Requirements */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 md:p-8 space-y-5">
            <h3 className="text-sm font-bold text-[#E85239] uppercase tracking-wider">
              Step 3: Requirements
            </h3>
            <div className="divide-y divide-border/30 rounded-xl border border-border/40 overflow-hidden">
              {test.taskRequirements?.map((req: string, i: number) => (
                <div key={i} className="p-4 flex gap-3 text-sm text-text-secondary bg-surface/10 hover:bg-surface/20 transition-colors">
                  <CheckCircle className="w-4 h-4 text-[#E85239] shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="leading-relaxed">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Rules & Limits */}
          {test.constraints && test.constraints.length > 0 && (
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 md:p-8 space-y-5">
              <h3 className="text-sm font-bold text-[#E85239] uppercase tracking-wider">
                Step 4: Rules & Limits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {test.constraints.map((c: string, i: number) => (
                  <div key={i} className="p-4 bg-surface/30 border border-border/40 rounded-xl flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E85239] shrink-0 mt-2" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Step 5: Deliverables */}
          {test.deliverables && test.deliverables.length > 0 && (
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 md:p-8 space-y-5">
              <h3 className="text-sm font-bold text-[#E85239] uppercase tracking-wider">
                Step 5: Deliverables
              </h3>
              <div className="bg-surface/10 border border-border/30 rounded-xl p-5 space-y-4">
                {test.deliverables.map((d: string, i: number) => (
                  <div key={i} className="flex items-start gap-3.5 text-xs text-text-secondary leading-relaxed">
                    <span className="w-4 h-4 rounded bg-white border border-[#E85239]/20 flex items-center justify-center shrink-0 text-[#E85239] font-bold mt-0.5 text-[10px]">
                      {i + 1}
                    </span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM: Workflow Console (Placed inside space-y-8 to ensure perfect spacing consistency) */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-[0_4px_20px_-4px_rgba(232,82,57,0.06)] p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E85239]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Upper part: Clean Text Header (Only show for assigned and in_progress states) */}
            {(test.status === "assigned" || test.status === "in_progress") && (
              <div className="space-y-2.5 max-w-xl">
                <div className="flex items-center gap-2 text-[#E85239]">
                  <Info className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Workflow Guide</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-text-primary">
                  {test.status === "in_progress" ? "Assignment Active" : "Assignment Submission"}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {test.status === "assigned" && "Your custom skills assessment is ready. Please download the assignment brief as a PDF to review the full details and click Begin Assignment when you are ready to start."}
                  {test.status === "in_progress" && "Please download the assignment details as a PDF, build your custom solution, and submit your link below when you are finished."}
                </p>
              </div>
            )}

            {/* If assigned, show the buttons right here at the bottom */}
            {test.status === "assigned" && (
              <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
                {/* Button 1: Download PDF (Bordered Brand Style) */}
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={downloading}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 border border-[#E85239]/20 hover:border-[#E85239]/40 hover:bg-[#FCE1DC]/10 text-[#E85239] rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 min-w-[160px] h-[50px] bg-white"
                >
                  {downloading ? (
                    <span className="w-4 h-4 border-2 border-[#E85239] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileDown size={16} strokeWidth={2.5} />
                  )}
                  Download PDF
                </button>

                {/* Button 2: Begin Assignment */}
                <button
                  onClick={handleStartTest}
                  disabled={starting}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E85239] hover:bg-[#d44127] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 min-w-[160px] h-[50px]"
                >
                  {starting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  Begin Assignment
                </button>
              </div>
            )}

            {/* If in_progress, show the form and place the buttons side-by-side at the bottom of the form */}
            {test.status === "in_progress" && (
              <div id="submit-form" className="pt-6 border-t border-border/30 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-primary font-sans">Submission Link *</label>
                    <input
                      type="url"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      placeholder="e.g. GitHub repository, Figma project, or Google Drive URL"
                      className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85239]/20 focus:border-[#E85239] transition-all text-text-primary placeholder:text-text-tertiary"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-primary font-sans">Short Notes (Optional)</label>
                    <input
                      type="text"
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      placeholder="e.g. Setup instructions, passwords, design notes, or comments..."
                      className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85239]/20 focus:border-[#E85239] transition-all text-text-primary placeholder:text-text-tertiary"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-error-muted border border-error/20 rounded-xl text-xs text-error">
                    {error}
                  </div>
                )}

                {/* Symmetrical Bottom Actions Flex Container */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border/20">
                  {/* Left Side / Secondary Action: Download PDF */}
                  <button 
                    onClick={handleDownloadPDF} 
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 border border-[#E85239]/20 hover:border-[#E85239]/40 hover:bg-[#FCE1DC]/10 text-[#E85239] rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 min-w-[160px] h-[50px] bg-white"
                  >
                    {downloading ? (
                      <span className="w-4 h-4 border-2 border-[#E85239] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileDown size={16} strokeWidth={2.5} className="text-[#E85239]" />
                    )}
                    Download PDF
                  </button>

                  {/* Right Side / Primary Action: Submit Assignment */}
                  <button 
                    onClick={handleSubmitTest} 
                    disabled={submitting || !submissionUrl}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#E85239] hover:bg-[#d44127] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 min-w-[180px] h-[50px]"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    Submit Assignment
                  </button>
                </div>
              </div>
            )}

            {/* If submitted/under_review/evaluated, show a highly clean, single success card layout */}
            {(test.status === "submitted" || test.status === "under_review" || test.status === "evaluated") && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E85239]/10 text-[#E85239] flex items-center justify-center shrink-0">
                    <CheckCircle size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Assignment Submitted</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {test.status === "evaluated" 
                        ? "Evaluation is complete. Check details on your dashboard." 
                        : "Your submission has been received successfully and is currently under review by our senior expert panel."}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/30 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Submitted Link</span>
                      <p className="font-sans text-text-primary overflow-hidden text-ellipsis pt-1">
                        <a 
                          href={test.submissionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#E85239] hover:underline font-semibold"
                        >
                          {test.submissionUrl}
                        </a>
                      </p>
                    </div>
                    {test.submissionNotes && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Submission Notes</span>
                        <p className="text-text-secondary font-sans leading-relaxed pt-1">
                          {test.submissionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-end gap-4">
                  {test.status === "evaluated" && (
                    <button
                      onClick={handleRetest}
                      disabled={retesting}
                      className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98] text-center ${test.evaluation?.total < 10 ? "bg-[#E85239] hover:bg-[#d44127] text-white" : "bg-white border border-[#E85239]/20 hover:border-[#E85239]/40 hover:bg-[#FCE1DC]/10 text-[#E85239]"}`}
                    >
                      {retesting ? "Generating..." : (test.evaluation?.total < 10 ? "Mandatory Retest Required" : "Retest this skill")}
                    </button>
                  )}
                  {!(test.status === "evaluated" && test.evaluation?.total < 10) && (
                    <button
                      onClick={() => router.push(source === 'capability' ? '/freelancer/capability' : '/freelancer/workspace')}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#E85239] hover:bg-[#d44127] text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_16px_rgba(232,82,57,0.15)] hover:shadow-[0_6px_20px_rgba(232,82,57,0.25)] active:scale-[0.98] text-center"
                    >
                      {source === 'capability' ? "Go to Skills Profile" : "Go to Dashboard"}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Previous Tests UI */}
        {allTests.length > 1 && (
          <div className="mt-12 pt-8 border-t border-border/60">
            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-6">
              Previous Assessments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allTests.map((t: any) => {
                const isActive = t._id === test?._id;
                return (
                  <button
                    key={t._id}
                    onClick={() => router.push(`/freelancer/test?id=${t._id}`)}
                    className={`text-left p-4 rounded-xl border transition-all ${isActive ? "border-[#E85239] bg-[#E85239]/5 ring-1 ring-[#E85239]" : "border-border bg-white hover:border-border-strong hover:shadow-sm"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-[#E85239]" : "text-text-tertiary"}`}>
                        {t.status === "evaluated" ? "Completed" : t.status.replace("_", " ")}
                      </span>
                      {t.status === "evaluated" && (() => {
                        const scoreVal = t.evaluation?.total || 0;
                        const isFailed = scoreVal < 10;
                        return (
                          <span className={`text-xs font-bold ${isFailed ? "text-error" : "text-success"}`}>
                            {isFailed ? "Failed" : `${Math.round((scoreVal / 50) * 100)}%`}
                          </span>
                        );
                      })()}
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary line-clamp-1 mb-1">
                      {t.specializations?.[0] || t.specialization || "Assessment"}
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
