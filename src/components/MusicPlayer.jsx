import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

/* ─── Gentle Acoustic Celesta Melody (Music Box Synthesizer) ─── */
const NOTE_FREQ = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  C5: 523.25,
};

const MELODY = [
  ['C4', 0.75], ['C4', 0.25], ['D4', 1.0], ['C4', 1.0], ['F4', 1.0], ['E4', 2.0],
  ['C4', 0.75], ['C4', 0.25], ['D4', 1.0], ['C4', 1.0], ['G4', 1.0], ['F4', 2.0],
  ['C4', 0.75], ['C4', 0.25], ['C5', 1.0], ['A4', 1.0], ['F4', 1.0], ['E4', 0.6], ['D4', 1.4],
  ['Bb4', 0.75], ['Bb4', 0.25], ['A4', 1.0], ['F4', 1.0], ['G4', 1.0], ['F4', 2.5],
];

const BPM = 120;
const BEAT_DUR = 60 / BPM;

export default function MusicPlayer({ isPlaying, onToggle }) {
  const ctxRef = useRef(null);
  const activeNodesRef = useRef([]);
  const loopTimerRef = useRef(null);

  const playChime = useCallback((ctx, freq, startTime, duration) => {
    if (!freq) return;

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 1.5);
    noteGain.connect(ctx.destination);

    // Fundamental soft sine
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc1.connect(noteGain);
    osc1.start(startTime);
    osc1.stop(startTime + duration * 1.6);
    activeNodesRef.current.push(osc1);

    // Warm music box overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.06, startTime);
    osc2Gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7);
    osc2.connect(osc2Gain).connect(noteGain);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.8);
    activeNodesRef.current.push(osc2);
  }, []);

  const scheduleMelody = useCallback((ctx, startTime) => {
    let t = startTime;
    MELODY.forEach(([note, beats]) => {
      const freq = NOTE_FREQ[note];
      const dur = beats * BEAT_DUR;
      playChime(ctx, freq, t, dur);
      t += dur;
    });
    return t;
  }, [playChime]);

  useEffect(() => {
    if (!isPlaying) {
      activeNodesRef.current.forEach((n) => {
        try { n.stop(); } catch { /* ignore */ }
      });
      activeNodesRef.current = [];
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
      return;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const startLoop = () => {
      if (ctx.state === 'closed') return;
      const endTime = scheduleMelody(ctx, ctx.currentTime + 0.05);
      const totalMs = (endTime - ctx.currentTime) * 1000 + 400;
      loopTimerRef.current = setTimeout(startLoop, totalMs);
    };

    // If browser auto-suspends audio without gesture, resume on first user interaction anywhere
    if (ctx.state === 'suspended') {
      const handleFirstInteraction = () => {
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            startLoop();
          }).catch(() => {});
        }
      };
      window.addEventListener('click', handleFirstInteraction, { once: true });
      window.addEventListener('touchstart', handleFirstInteraction, { once: true });
      window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
      window.addEventListener('keydown', handleFirstInteraction, { once: true });
    } else {
      startLoop();
    }

    return () => {
      activeNodesRef.current.forEach((n) => {
        try { n.stop(); } catch { /* ignore */ }
      });
      activeNodesRef.current = [];
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (ctx.state !== 'closed') ctx.close().catch(() => {});
    };
  }, [isPlaying, scheduleMelody]);

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onToggle}
        className="group relative flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#FAF7F2]/90 backdrop-blur-md border border-[#2B2523]/15 shadow-[0_4px_16px_rgba(45,35,30,0.1)] transition-all"
        title={isPlaying ? 'Tạm dừng nhạc hộp thư' : 'Phát nhạc mừng sinh nhật'}
      >
        {/* Minimal Spinning Vinyl Disc (40px) */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
          <motion.div
            className="w-full h-full rounded-full bg-[#201D1C] flex items-center justify-center border border-stone-800"
            animate={isPlaying ? { rotate: 360 } : {}}
            transition={
              isPlaying
                ? { repeat: Infinity, duration: 4.5, ease: 'linear' }
                : { duration: 0.4 }
            }
          >
            {/* Fine Vinyl Grooves */}
            <div className="w-7 h-7 rounded-full border border-stone-700/50 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border border-stone-700/40 flex items-center justify-center">
                {/* Center Label (Vintage terracotta dot) */}
                <div className="w-3 h-3 rounded-full bg-[#B45339] border border-stone-600 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-stone-900" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center Play/Pause Indicator Icon on hover or pause */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white">
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </div>
        </div>

        {/* Minimal Label */}
        <div className="text-left">
          <div className="text-[11px] font-sans font-medium text-stone-800 leading-tight">
            {isPlaying ? 'Giai điệu' : 'Phát nhạc'}
          </div>
          <div className="text-[9px] font-mono text-stone-400">
            {isPlaying ? 'Đang xoay' : 'Dừng'}
          </div>
        </div>
      </motion.button>
    </div>
  );
}
