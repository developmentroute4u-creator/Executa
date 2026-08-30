import { jsPDF } from "jspdf";

export interface AssessmentDataForPdf {
  assignmentTitle: string;
  assignmentSummary?: string;
  domain?: string;
  capabilityArea?: string;
  level?: number;
  projectOverview?: {
    background?: string;
    currentSituation?: string;
    businessProblem?: string;
    expectedOutcome?: string;
  };
  yourRole?: string;
  projectObjectives?: string[];
  constraints?: string[];
  exceptions?: string[];
  successCriteria?: string;
  deliverables?: Array<{
    label: string;
    description: string;
    required: boolean;
  }>;
  commonMistakes?: string[];
  importantNotes?: string[];
}

export function generateAssessmentPdf(data: AssessmentDataForPdf) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2; // 170mm
  const bottomMargin = 22;
  let y = margin;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  }

  function drawPageHeader() {
    // Subtle top running header for pages 2+
    if (doc.getNumberOfPages() > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("EXECUTA • CAPABILITY ASSESSMENT BRIEF", margin, 12);
      const titleTruncated = doc.splitTextToSize(data.assignmentTitle || "Assignment", 80)[0];
      doc.text(titleTruncated, pageWidth - margin, 12, { align: "right" });
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.line(margin, 14, pageWidth - margin, 14);
    }
  }

  // ── 1. Document Header ──
  // Top tag
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(232, 82, 57); // #E85239
  doc.text("EXECUTA VERIFIED TALENT • CAPABILITY ASSESSMENT", margin, y);
  y += 6;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  const titleLines = doc.splitTextToSize(data.assignmentTitle || "Capability Assessment Brief", contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7.5 + 2;

  // Meta pills row (Domain, Area, Level)
  const domainText = (data.domain || "General").toUpperCase();
  const areaText = (data.capabilityArea || "Engineering").toUpperCase();
  const levelText = `LEVEL ${data.level || 2}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  // Meta text
  doc.text(`DOMAIN: ${domainText}   |   SPECIALIZATION: ${areaText}   |   DIFFICULTY: ${levelText}`, margin, y);
  y += 4;

  // Accent horizontal divider
  doc.setDrawColor(232, 82, 57);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 35, y);
  doc.setDrawColor(225, 225, 225);
  doc.setLineWidth(0.3);
  doc.line(margin + 35, y, pageWidth - margin, y);
  y += 8;

  // ── Helper to print section titles ──
  function printSectionTitle(num: string, title: string) {
    checkPageBreak(14);
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(232, 82, 57);
    doc.text(`${num}.`, margin, y);

    doc.setTextColor(26, 26, 26);
    doc.text(title.toUpperCase(), margin + 7, y);
    y += 2;

    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  }

  // ── Helper to print regular wrapped body paragraphs ──
  function printParagraph(text: string, fontSize = 9.5, isMuted = false) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    if (isMuted) {
      doc.setTextColor(110, 110, 110);
    } else {
      doc.setTextColor(50, 50, 50);
    }
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 4.5 + 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  }

  // ── Helper to print bullet list ──
  function printBullets(items: string[]) {
    if (!items || items.length === 0) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    items.forEach((item) => {
      const bulletLines = doc.splitTextToSize(item, contentWidth - 8);
      checkPageBreak(bulletLines.length * 4.2 + 2);

      // Bullet dot
      doc.setFillColor(232, 82, 57);
      doc.circle(margin + 2, y - 1, 0.8, "F");

      doc.text(bulletLines, margin + 6, y);
      y += bulletLines.length * 4.2 + 2;
    });
    y += 2;
  }

  // ── Helper to print numbered list ──
  function printNumberedList(items: string[]) {
    if (!items || items.length === 0) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    items.forEach((item, index) => {
      const numLabel = `${index + 1}.`;
      const lines = doc.splitTextToSize(item, contentWidth - 8);
      checkPageBreak(lines.length * 4.2 + 2);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(232, 82, 57);
      doc.text(numLabel, margin, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(lines, margin + 6, y);
      y += lines.length * 4.2 + 2.5;
    });
    y += 2;
  }

  // ── 01. Assignment Summary ──
  if (data.assignmentSummary) {
    printSectionTitle("01", "Assignment Summary");
    printParagraph(data.assignmentSummary);
  }

  // ── 02. Project Overview ──
  if (data.projectOverview) {
    const { background, currentSituation, businessProblem, expectedOutcome } = data.projectOverview;
    if (background || currentSituation || businessProblem || expectedOutcome) {
      printSectionTitle("02", "Project Overview");

      if (background) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(110, 110, 110);
        doc.text("BUSINESS BACKGROUND", margin, y);
        y += 4;
        printParagraph(background);
      }

      if (currentSituation) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(110, 110, 110);
        doc.text("CURRENT SITUATION", margin, y);
        y += 4;
        printParagraph(currentSituation);
      }

      if (businessProblem) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(110, 110, 110);
        doc.text("THE CORE PROBLEM", margin, y);
        y += 4;
        printParagraph(businessProblem);
      }

      if (expectedOutcome) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(110, 110, 110);
        doc.text("EXPECTED OUTCOME", margin, y);
        y += 4;
        printParagraph(expectedOutcome);
      }
    }
  }

  // ── 03. Your Role ──
  if (data.yourRole) {
    printSectionTitle("03", "Your Role & Ownership");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(26, 26, 26);
    const roleLines = doc.splitTextToSize(data.yourRole, contentWidth);
    checkPageBreak(roleLines.length * 5 + 8);
    doc.text(roleLines, margin, y);
    y += roleLines.length * 5 + 3;

    printParagraph(
      "This project is yours to own. The architectural decisions you make, the trade-offs you navigate, and the quality of work you deliver are your professional responsibility.",
      8.5,
      true
    );
  }

  // ── 04. Project Objectives ──
  if (data.projectObjectives && data.projectObjectives.length > 0) {
    printSectionTitle("04", "Project Objectives");
    printNumberedList(data.projectObjectives);
  }

  // ── 05. Constraints ──
  if (data.constraints && data.constraints.length > 0) {
    printSectionTitle("05", "Constraints & Boundaries");
    printBullets(data.constraints);
  }

  // ── 06. Exceptions ──
  if (data.exceptions && data.exceptions.length > 0) {
    printSectionTitle("06", "Out of Scope / Exceptions");
    printParagraph(
      "The following items are intentionally excluded from this assessment and will not be evaluated:",
      8.5,
      true
    );
    printBullets(data.exceptions);
  }

  // ── 07. Success Criteria ──
  if (data.successCriteria) {
    printSectionTitle("07", "Success Criteria & Evaluation Standards");
    printParagraph(data.successCriteria);
    printParagraph(
      "Note: Evaluation benchmarks determine whether your submission reflects Level 1, Level 2, or Level 3 capability.",
      8.5,
      true
    );
  }

  // ── 08. Deliverables ──
  if (data.deliverables && data.deliverables.length > 0) {
    printSectionTitle("08", "Expected Deliverables");

    data.deliverables.forEach((deliv, idx) => {
      const tag = deliv.required ? "[REQUIRED]" : "[OPTIONAL]";
      const heading = `${idx + 1}. ${deliv.label}   ${tag}`;
      const descLines = doc.splitTextToSize(deliv.description, contentWidth - 6);

      checkPageBreak(descLines.length * 4.2 + 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(deliv.required ? 232 : 100, deliv.required ? 82 : 100, deliv.required ? 57 : 100);
      doc.text(heading, margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(descLines, margin + 4, y);
      y += descLines.length * 4.2 + 3;
    });
    y += 2;
  }

  // ── 09. Common Mistakes ──
  if (data.commonMistakes && data.commonMistakes.length > 0) {
    printSectionTitle("09", "Common Mistakes to Avoid");
    printParagraph(
      "Sense-check your final submission against these frequently encountered anti-patterns:",
      8.5,
      true
    );
    printBullets(data.commonMistakes);
  }

  // ── 10. Important Notes ──
  if (data.importantNotes && data.importantNotes.length > 0) {
    printSectionTitle("10", "Important Notes");
    printNumberedList(data.importantNotes);
  }

  // ── Add page numbers to all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);

    // Footer divider line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    // Footer text
    doc.text("Executa • Capability Assessment Document", margin, pageHeight - 9);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: "right" });
  }

  // Generate safe filename
  const cleanTitle = (data.assignmentTitle || "assignment")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const filename = `${cleanTitle || "executa-assignment"}-brief.pdf`;

  // Direct local file download
  doc.save(filename);
}
