import React from 'react';

/* ─── 1. Delicate Botanical Sprig (Pen & Ink Line-art) ─── */
export function BotanicalSprig({ className = "w-16 h-8", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Central stem */}
      <path d="M5 20 C35 18, 70 21, 115 19" />
      {/* Leaves left & right */}
      <path d="M25 19 C28 12, 36 10, 40 14 C36 17, 30 19, 25 19 Z" fill={color} fillOpacity="0.08" />
      <path d="M35 20 C38 27, 46 29, 50 25 C46 22, 40 20, 35 20 Z" fill={color} fillOpacity="0.08" />
      <path d="M55 19 C58 11, 67 9, 72 13 C68 16, 61 19, 55 19 Z" fill={color} fillOpacity="0.08" />
      <path d="M68 20 C71 28, 80 30, 85 26 C81 22, 74 20, 68 20 Z" fill={color} fillOpacity="0.08" />
      <path d="M88 19 C92 12, 100 11, 104 15 C100 18, 93 19, 88 19 Z" fill={color} fillOpacity="0.08" />
      {/* Delicate floral bud tip */}
      <circle cx="115" cy="19" r="2" fill={color} fillOpacity="0.6" />
    </svg>
  );
}

/* ─── 2. Symmetrical Botanical Laurel Wreath Header ─── */
export function BotanicalWreath({ className = "w-28 h-10", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left branch */}
      <path d="M80 38 C55 38, 30 30, 15 12" />
      <path d="M30 28 C26 23, 27 16, 32 17 C34 21, 32 25, 30 28 Z" fill={color} fillOpacity="0.1" />
      <path d="M45 33 C42 27, 44 20, 49 22 C50 26, 47 30, 45 33 Z" fill={color} fillOpacity="0.1" />
      <path d="M62 37 C60 30, 63 24, 68 26 C68 30, 65 34, 62 37 Z" fill={color} fillOpacity="0.1" />

      {/* Center Star / Floret */}
      <circle cx="80" cy="38" r="2.5" fill={color} fillOpacity="0.7" />

      {/* Right branch */}
      <path d="M80 38 C105 38, 130 30, 145 12" />
      <path d="M130 28 C134 23, 133 16, 128 17 C126 21, 128 25, 130 28 Z" fill={color} fillOpacity="0.1" />
      <path d="M115 33 C118 27, 116 20, 111 22 C110 26, 113 30, 115 33 Z" fill={color} fillOpacity="0.1" />
      <path d="M98 37 C100 30, 97 24, 92 26 C92 30, 95 34, 98 37 Z" fill={color} fillOpacity="0.1" />
    </svg>
  );
}

/* ─── 3. Vintage Postage Stamp (Perforated Paper Stamp) ─── */
export function VintagePostageStamp({
  price = "12¢",
  label = "AIR MAIL",
  color = "#58705C",
  bgColor = "#F4EFE6",
}) {
  return (
    <div
      className="relative w-20 h-24 p-1.5 flex flex-col items-center justify-between shadow-sm select-none"
      style={{
        backgroundColor: bgColor,
        boxShadow: '0 3px 8px rgba(45,35,30,0.12)',
        border: '1.5px dashed rgba(60, 50, 40, 0.35)',
      }}
    >
      {/* Inner thin frame */}
      <div className="w-full h-full border border-stone-400/40 p-1 flex flex-col items-center justify-between">
        <div className="flex items-center justify-between w-full text-[8px] font-serif tracking-widest text-stone-700/80 uppercase">
          <span>{label}</span>
          <span className="font-bold">{price}</span>
        </div>

        {/* Botanical Engraving Icon inside stamp */}
        <div className="my-auto opacity-75">
          <svg width="28" height="34" viewBox="0 0 32 40" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M16 36 V10" strokeLinecap="round" />
            <path d="M16 26 C11 22, 8 16, 13 14 C17 17, 16 22, 16 26 Z" fill={color} fillOpacity="0.2" />
            <path d="M16 20 C21 16, 24 10, 19 8 C15 11, 16 16, 16 20 Z" fill={color} fillOpacity="0.2" />
            <circle cx="16" cy="7" r="2.5" fill={color} />
          </svg>
        </div>

        <div className="text-[7px] tracking-widest font-mono text-stone-500 uppercase">
          POSTES • 1924
        </div>
      </div>
    </div>
  );
}

/* ─── 4. Vintage Postmark Postal Cancellation Stamp ─── */
export function PostmarkStamp({ text = "PARIS R.P.", date = "14 NOV 2026" }) {
  return (
    <div className="relative flex items-center gap-1 select-none pointer-events-none opacity-60">
      {/* Circular cancellation mark */}
      <div className="w-14 h-14 rounded-full border-2 border-stone-600/60 p-0.5 flex flex-col items-center justify-center text-center -rotate-12">
        <span className="text-[7px] font-mono tracking-tighter uppercase font-bold text-stone-700">
          {text}
        </span>
        <span className="text-[6px] font-mono tracking-widest text-stone-600 my-0.5">
          {date}
        </span>
        <div className="w-6 h-[0.8px] bg-stone-500/50" />
      </div>

      {/* Wavy cancellation ink lines */}
      <svg width="34" height="26" viewBox="0 0 40 30" fill="none" stroke="rgba(80,70,60,0.5)" strokeWidth="1.2">
        <path d="M0 6 Q 10 2, 20 6 T 40 6" />
        <path d="M0 14 Q 10 10, 20 14 T 40 14" />
        <path d="M0 22 Q 10 18, 20 22 T 40 22" />
      </svg>
    </div>
  );
}

/* ─── 5. Vintage Illustrated Pedestal Cake (Custom Hand-drawn Line-Art) ─── */
export function VintageCakeArt({ color = "#2B2523", accent = "#B45339" }) {
  return (
    <svg
      viewBox="16 37 148 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-40 sm:w-44 h-auto select-none"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top cream rosettes piping */}
      <path d="M42 42 C44 38, 48 38, 50 42 C52 38, 56 38, 58 42 C60 38, 64 38, 66 42 C68 38, 72 38, 74 42 C76 38, 80 38, 82 42 C84 38, 88 38, 90 42 C92 38, 96 38, 98 42 C100 38, 104 38, 106 42 C108 38, 112 38, 114 42 C116 38, 120 38, 122 42 C124 38, 128 38, 130 42 C132 38, 136 38, 138 42" />

      {/* Upper tier sponge */}
      <path d="M42 42 L40 65 C40 68, 140 68, 140 65 L138 42" fill="#FAF6EE" fillOpacity="0.85" />

      {/* Cream drip garland swags */}
      <path d="M40 52 Q 52 58, 65 52 Q 78 58, 90 52 Q 103 58, 115 52 Q 128 58, 140 52" strokeWidth="1" />
      <path d="M45 59 Q 65 64, 90 59 Q 115 64, 135 59" strokeWidth="0.8" strokeDasharray="2 2" />

      {/* Base tier cake */}
      <path d="M30 65 L28 86 C28 91, 152 91, 152 86 L150 65 Z" fill="#F4EFE6" fillOpacity="0.9" />

      {/* Fine fluted pattern on lower tier */}
      <path d="M35 70 V 86 M50 70 V 87 M65 70 V 88 M80 70 V 88 M95 70 V 88 M110 70 V 88 M125 70 V 87 M145 70 V 86" strokeWidth="0.7" opacity="0.4" />

      {/* Bottom pearl piping */}
      <path d="M28 86 C32 89, 36 89, 40 86 C44 89, 48 89, 52 86 C56 89, 60 89, 64 86 C68 89, 72 89, 76 86 C80 89, 84 89, 88 86 C92 89, 96 89, 100 86 C104 89, 108 89, 112 86 C116 89, 120 89, 124 86 C128 89, 132 89, 136 86 C140 89, 144 89, 148 86 C150 88, 152 88, 152 86" fill="#FAF6EE" />

      {/* Antique Pedestal Stand & Base */}
      <path d="M18 90 C18 88, 162 88, 162 90 L158 93 C158 95, 22 95, 22 93 Z" fill="#ECE7DE" />
      <path d="M82 94 L80 104 C70 106, 60 108, 55 110 H 125 C120 108, 110 106, 100 104 L98 94 Z" fill="#E2DDD4" />
      <line x1="52" y1="110" x2="128" y2="110" strokeWidth="2" />
    </svg>
  );
}

