import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { VintageCakeArt } from './BotanicalArtwork';

function Flame({ lit, onClick, index }) {
  return (
    <div
      className="relative flex flex-col items-center cursor-pointer group"
      onClick={onClick}
      title="Nhấp để thổi tắt nến"
    >
      <AnimatePresence>
        {lit ? (
          <motion.div
            key="flame"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="relative flex flex-col items-center"
          >
            {/* Warm candle glow aura */}
            <motion.div
              className="absolute -top-2.5 w-6 h-6 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.55) 0%, transparent 70%)',
                filter: 'blur(3px)',
              }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.12, 0.95] }}
              transition={{ repeat: Infinity, duration: 0.35, delay: index * 0.06 }}
            />

            {/* Teardrop golden beeswax flame */}
            <div
              className="stationery-candle-flame w-2.5 h-4 rounded-[50%_50%_35%_35%]"
              style={{
                background: 'linear-gradient(to top, #D97706 0%, #F59E0B 45%, #FEF3C7 100%)',
              }}
            />
          </motion.div>
        ) : (
          /* Subtle smoke drift */
          <motion.div
            key="smoke"
            initial={{ opacity: 0.7, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -18, scale: 1.4, x: (index % 2 === 0 ? 3 : -3) }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute -top-4 text-[11px] select-none pointer-events-none text-stone-500 font-mono"
          >
            ~
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CandleStick({ lit, onBlow, index }) {
  return (
    <div className="flex flex-col items-center mx-1 group">
      <Flame lit={lit} onClick={onBlow} index={index} />
      {/* Cotton wick */}
      <div className="w-[1.2px] h-1.5 bg-stone-800 rounded-t" />
      {/* Hand-dipped beeswax candle body */}
      <div
        className="w-2.5 h-6 rounded-t-sm rounded-b shadow-xs relative overflow-hidden transition-transform group-hover:scale-105"
        style={{
          background: 'linear-gradient(to right, #EFECE6 0%, #E2DDD5 50%, #FAF8F5 80%, #D8D2C6 100%)',
          border: '1px solid rgba(43, 37, 35, 0.15)',
        }}
      />
    </div>
  );
}

export default function CandleBlowing({ count = 5, onAllBlown, palette }) {
  const safeCount = Math.max(1, Math.min(count, 9));
  const [litCandles, setLitCandles] = useState(() => new Array(safeCount).fill(true));
  const allBlownRef = useRef(false);

  // Audio blow detection
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    setLitCandles(new Array(safeCount).fill(true));
    allBlownRef.current = false;
  }, [safeCount]);

  useEffect(() => {
    if (litCandles.every((l) => !l) && !allBlownRef.current) {
      allBlownRef.current = true;
      onAllBlown?.();
    }
  }, [litCandles, onAllBlown]);

  const blowCandle = useCallback((index) => {
    setLitCandles((prev) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  const relightCandles = () => {
    setLitCandles(new Array(safeCount).fill(true));
    allBlownRef.current = false;
  };

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastBlowTime = 0;

      const processAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

        const now = Date.now();
        if (avg > 38 && now - lastBlowTime > 180) {
          lastBlowTime = now;
          setLitCandles((prev) => {
            const firstLit = prev.indexOf(true);
            if (firstLit === -1) return prev;
            const updated = [...prev];
            updated[firstLit] = false;
            return updated;
          });
        }

        animFrameRef.current = requestAnimationFrame(processAudio);
      };

      processAudio();
    } catch (err) {
      console.warn('Microphone permission issue:', err);
      setMicActive(false);
    }
  }, []);

  const stopMic = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    setMicActive(false);
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return () => stopMic();
  }, [stopMic]);

  return (
    <div className="flex flex-col items-center select-none w-full mt-1">
      {/* Candles placed standing directly on the cake */}
      <div className="relative flex flex-col items-center">
        {/* Row of candles sitting directly on top cake tier */}
        <div className="flex items-end justify-center z-10 -mb-2 w-full max-w-[115px]">
          {litCandles.map((lit, i) => (
            <CandleStick
              key={i}
              index={i}
              lit={lit}
              onBlow={() => blowCandle(i)}
            />
          ))}
        </div>

        {/* Vintage Illustrated Cake Art */}
        <VintageCakeArt color={palette?.inkColor || '#2B2523'} accent={palette?.accentColor || '#B45339'} />
      </div>

      {/* Tactile High-Contrast Control Buttons */}
      <div className="flex items-center justify-center gap-2 mt-2 pt-1 z-30">
        {/* Mic Blow Button (High contrast dark button or active terracotta) */}
        <button
          onClick={micActive ? stopMic : startMic}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm ${
            micActive
              ? 'bg-[#B45339] text-[#FFF9F5] border border-[#B45339] animate-pulse'
              : 'bg-[#2B2523] text-[#FAF7F2] hover:bg-[#3D3532] border border-[#2B2523]'
          }`}
          title="Bật micro và thổi vào mic để dập nến"
        >
          {micActive ? <MicOff size={13} /> : <Mic size={13} />}
          <span>{micActive ? 'Tắt Micro' : 'Thổi Bằng Mic'}</span>
        </button>

        {/* Relight Button (Clear bordered contrast button) */}
        <button
          onClick={relightCandles}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] text-[#2B2523] hover:bg-[#EFECE6] border border-[#2B2523]/30 transition-all shadow-sm"
          title="Thắp lại toàn bộ ngọn nến"
        >
          <RotateCcw size={12} />
          <span>Thắp Lại</span>
        </button>
      </div>

      {/* Live mic breath volume bar */}
      {micActive && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-stone-600 font-sans font-medium">Mức gió thổi:</span>
          <div className="w-20 h-1.5 rounded-full bg-stone-300 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#B45339] transition-all duration-75"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
