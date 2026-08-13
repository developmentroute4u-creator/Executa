"use client";

interface ExecutaLogoProps {
  expanded: boolean;
}

/**
 * ExecutaLogo — "F" is always anchored. On expand, "INDADE" + dot slide in from the right.
 *
 * Layout:
 *   [F fixed] → [INDADE slides in via max-width] → [dot always visible]
 *
 * The "E" never moves. The sidebar's Framer Motion handles the pill width.
 * max-width is used (not width) for a reliable cross-zoom CSS transition.
 */
export default function ExecutaLogo({ expanded }: ExecutaLogoProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "44px",
        display: "flex",
        alignItems: "flex-end",
        paddingLeft: "8px", // Precisely centers "E." within the 42px collapsed rail width
        paddingBottom: "2px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* ── "F" — always visible, never moves ── */}
      <span
        style={{
          fontFamily: "'Inter Tight', 'Inter', 'Arial Black', Arial, sans-serif",
          fontSize: "26px",
          fontWeight: 900,
          color: "#1C1917",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        F
      </span>

      {/* ── "INDADE" — slides in from F's right edge ── */}
      <div
        style={{
          overflow: "hidden",
          maxWidth: expanded ? "160px" : "0px",
          transition: "max-width 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter Tight', 'Inter', 'Arial Black', Arial, sans-serif",
            fontSize: "26px",
            fontWeight: 900,
            color: "#1C1917",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            userSelect: "none",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          INDADE
        </span>
      </div>

      {/* ── Red dot — always visible, floats at the end of text ── */}
      <span
        style={{
          display: "inline-block",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#E63E00",
          marginBottom: "4px",
          marginLeft: "2px",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
