import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CardPreview from './components/CardPreview';
import MusicPlayer from './components/MusicPlayer';
import FloatingPillBar from './components/FloatingPillBar';
import { useCardState } from './hooks/useCardState';
import { BotanicalSprig } from './components/BotanicalArtwork';

export default function App() {
  const {
    cardState,
    palette,
    isViewMode,
    updateField,
    updateTemplate,
    resetCard,
    saveCard,
    loadCard,
    deleteCard,
    savedCards,
    generateShareUrl,
  } = useCardState();

  const [musicPlaying, setMusicPlaying] = useState(true);

  /* ═══════════════════════════════════════════════════════════
     VIEW MODE: Khi người nhận mở đường link thiệp (?card=...)
     ═══════════════════════════════════════════════════════════ */
  if (isViewMode) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#F7F4EF] relative select-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl z-10 flex flex-col items-center"
        >
          <CardPreview
            cardState={cardState}
            palette={palette}
            updateField={updateField}
            isViewMode={true}
          />
        </motion.div>

        {/* Minimalist Spinning Vinyl Disc in corner */}
        <MusicPlayer
          isPlaying={musicPlaying}
          onToggle={() => setMusicPlaying(!musicPlaying)}
        />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     EDITORIAL ATELIER STUDIO WORKSPACE
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F7F4EF] text-[#2B2523] relative select-none pb-28">
      {/* ── TOP EDITORIAL MASTHEAD ── */}
      <header className="w-full pt-6 pb-3 px-6 flex flex-col items-center text-center border-b border-stone-200/60 bg-[#FAF7F2]/50">
        <div className="flex items-center gap-2 mb-1">
          <BotanicalSprig className="w-12 h-4 text-stone-500" />
          <span className="text-[10px] font-serif tracking-[0.28em] uppercase text-stone-600 font-semibold">
            Boutique Stationery Atelier
          </span>
          <BotanicalSprig className="w-12 h-4 text-stone-500 -scale-x-100" />
        </div>
        <h1 className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-stone-900">
          Thiệp Sinh Nhật Giấy Mỹ Thuật 3D
        </h1>
        <p className="text-xs font-sans text-stone-500 max-w-md mt-1">
          Thiết kế thiệp gấp đôi thủ công với tem thư cổ điển, khung ảnh Polaroid và bánh kem nến tương tác
        </p>
      </header>

      {/* ── MAIN CENTRAL CANVAS (BI-FOLD CARD & ENVELOPE) ── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-center">
        <CardPreview
          cardState={cardState}
          palette={palette}
          updateField={updateField}
          isViewMode={false}
        />
      </main>

      {/* ── MINIMAL SPINNING VINYL DISC (BOTTOM RIGHT) ── */}
      <MusicPlayer
        isPlaying={musicPlaying}
        onToggle={() => setMusicPlaying(!musicPlaying)}
      />

      {/* ── FLOATING BOTTOM PILL-BAR (APPLE / FIGMA STYLE DOCK) ── */}
      <FloatingPillBar
        cardState={cardState}
        palette={palette}
        updateField={updateField}
        updateTemplate={updateTemplate}
        resetCard={resetCard}
        saveCard={saveCard}
        savedCards={savedCards}
        loadCard={loadCard}
        deleteCard={deleteCard}
        generateShareUrl={generateShareUrl}
      />
    </div>
  );
}
