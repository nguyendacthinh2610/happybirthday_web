import React from 'react';

export default function Watermark() {
  return (
    <div className="flex items-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity select-none pointer-events-none">
      <span className="text-[9px] font-serif tracking-[0.2em] uppercase text-stone-600">
        Artisan Stationery • Handcrafted
      </span>
    </div>
  );
}
