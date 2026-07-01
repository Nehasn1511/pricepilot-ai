import React from 'react';

// PricePilot AI — Brand Logo
// A price tag shape with an upward-trending arrow
// Represents: pricing intelligence + growth direction
const PricePilotLogo = ({ size = 36, showText = true, collapsed = false }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: collapsed ? 0 : 10,
    }}>
      {/* ── Icon mark ─────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer rounded square background */}
        <rect width="40" height="40" rx="10" fill="#1677ff" />

        {/* Price tag shape — hexagon-ish tag */}
        <path
          d="M20 7 L30 12 L30 22 L20 33 L10 22 L10 12 Z"
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />

        {/* Small circle — the hole in a price tag */}
        <circle cx="20" cy="13" r="2" fill="rgba(255,255,255,0.6)" />

        {/* Upward trending arrow — the "AI pilot" element */}
        <path
          d="M13 25 L17 20 L20 23 L25 16 L27 18"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Arrow head */}
        <path
          d="M24 14 L27 18 L23 18"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* ── Wordmark ───────────────────────────────────── */}
      {showText && !collapsed && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.3px',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}>
            PricePilot
          </div>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginTop: 1,
          }}>
            AI
          </div>
        </div>
      )}
    </div>
  );
};

export default PricePilotLogo;