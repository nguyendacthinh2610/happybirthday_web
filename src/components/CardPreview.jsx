import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CARD_TEMPLATES, FONT_OPTIONS } from '../data/templates';
import EnvelopeAnimation from './EnvelopeAnimation';
import ConfettiCanvas from './ConfettiCanvas';
import CandleBlowing from './CandleBlowing';
import Watermark from './Watermark';
import {
  BotanicalSprig,
  VintagePostageStamp,
  PostmarkStamp,
} from './BotanicalArtwork';
import { RotateCcw, Camera, Upload } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { getPresetById } from '../data/samplePhotos';
import { isFirebaseConfigured, uploadImageToFirebase } from '../services/firebase';

export default function CardPreview({ cardState, palette, updateField, isViewMode }) {
  const {
    recipientName,
    wishMessage,
    template = 'botanical',
    fontFamily = 'charm',
    polaroidCaption = 'Kỷ niệm khó quên ✨',
    candleCount = 5,
    uploadedImage,
    envelopeOpen,
    age,
  } = cardState;

  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const photoInputRef = useRef(null);

  const currentTemplate =
    CARD_TEMPLATES.find((t) => t.id === template) || CARD_TEMPLATES[0];

  const selectedFont =
    FONT_OPTIONS.find((f) => f.id === fontFamily) || FONT_OPTIONS[0];

  const handleOpenEnvelope = useCallback(() => {
    updateField('envelopeOpen', true);
  }, [updateField]);

  const handleAllBlown = useCallback(() => {
    updateField('candlesBlown', true);
    setConfettiTrigger(true);
  }, [updateField]);

  const handleReEnvelope = (e) => {
    e.stopPropagation();
    updateField('envelopeOpen', false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // 1. Instantly display sharp local preview
      const compressedDataUrl = await compressImage(file, 640, 0.85);
      if (compressedDataUrl) {
        updateField('uploadedImage', compressedDataUrl);
      }
      // 2. If Firebase Storage is configured, upload for crystal-clear original resolution
      if (isFirebaseConfigured()) {
        uploadImageToFirebase(file)
          .then((fireUrl) => {
            if (fireUrl) updateField('uploadedImage', fireUrl);
          })
          .catch((err) => console.warn('Firebase upload fallback:', err));
      }
    } catch (err) {
      console.warn('Image processing error:', err);
    } finally {
      e.target.value = '';
    }
  };

  /* ═══════════════════════════════════════════════════════════
     BI-FOLD CARD (Thiệp gấp đôi 2 cánh mở sang hai bên)
     ═══════════════════════════════════════════════════════════ */
  const cardContent = (
    <div
      id="birthday-card-capture"
      className="relative w-full max-w-[880px] stationery-paper rounded-xl overflow-hidden my-4 select-none"
      style={{
        backgroundColor: palette?.paperBg || '#FAF7F2',
        color: palette?.inkColor || '#2B2523',
        boxShadow:
          '0 20px 50px -10px rgba(45, 35, 30, 0.16), 0 5px 15px -3px rgba(45, 35, 30, 0.08)',
      }}
    >
      {/* Hidden file picker for direct click-to-upload on Polaroid */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Bi-fold Center Crease Spine Shadow (Nếp gấp giữa hai cánh thiệp) */}
      <div className="hidden md:block bifold-spine-shadow" />

      {/* Close Back To Envelope Button */}
      {!isViewMode && (
        <button
          onClick={handleReEnvelope}
          title="Đóng lại vào phong bì"
          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-stone-800/10 hover:bg-stone-800/20 text-stone-700 transition-colors"
        >
          <RotateCcw size={13} />
        </button>
      )}

      {/* Grid of 2 Folding Wings */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-300/40">
        {/* ── LEFT WING (CÁNH TRÁI): Polaroid Photo & Vintage Stamps ── */}
        <div className="p-4 sm:p-8 flex flex-col justify-between items-center relative min-h-[400px] sm:min-h-[460px] bg-stone-50/40">
          {/* Top Postmark and Stamp Row */}
          <div className="w-full flex items-start justify-between">
            <PostmarkStamp text="PARIS R.P." date="14 NOV 2026" />
            <VintagePostageStamp
              price="25¢"
              label="SPECIAL"
              color={palette?.accentColor || '#58705C'}
              bgColor="#F3EFE6"
            />
          </div>

          {/* Centerpiece: Polaroid Photo with Washi Tape (Click to upload) */}
          <div className="my-auto py-4 flex flex-col items-center">
            <motion.div
              initial={{ rotate: -2 }}
              whileHover={{ rotate: 0, scale: 1.025 }}
              onClick={() => photoInputRef.current?.click()}
              className="group relative bg-[#FFFFFF] p-3 pb-5 rounded-sm shadow-[0_10px_25px_rgba(45,35,30,0.12)] border border-stone-200/80 max-w-[230px] cursor-pointer"
              title="Nhấp để thay ảnh kỷ niệm của bạn"
            >
              {/* Translucent Japanese Washi Tape on top */}
              <div
                className="tactile-washi-tape absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 -rotate-2"
                style={{ background: palette?.tapeTone || 'rgba(235, 222, 195, 0.85)' }}
              />

              {/* Photo Area with Hover Upload Badge */}
              <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden rounded-xs border border-stone-200">
                {uploadedImage && uploadedImage.startsWith('preset:') ? (
                  getPresetById(uploadedImage).render()
                ) : uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Birthday memory"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getPresetById('preset:flowers').render()
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center pointer-events-none">
                  <Camera size={18} className="mb-1" />
                  <span className="text-[10px] font-sans font-medium">Nhấp để đổi ảnh</span>
                </div>
              </div>

              {/* Handwritten Polaroid Caption */}
              <p className="mt-2.5 text-center text-sm font-charm font-semibold text-stone-700 tracking-wide">
                {polaroidCaption || 'Kỷ niệm khó quên ✨'}
              </p>
            </motion.div>
          </div>

          {/* Left Wing Footer Note */}
          <div className="w-full text-center pt-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400">
              MEMORIES • ARCHIVE NO. 2026
            </span>
          </div>
        </div>

        {/* ── RIGHT WING (CÁNH PHẢI): Title, Wishes, Cake & Candles ── */}
        <div className="p-4 sm:p-8 flex flex-col justify-between items-center text-center relative min-h-[400px] sm:min-h-[460px]">
          {/* Inner Editorial Double-line Frame */}
          <div className="absolute inset-3 editorial-frame rounded-sm pointer-events-none" />

          {/* Top Botanical Artwork Sprig Header */}
          <div className="z-10 pt-1">
            <BotanicalSprig className="w-24 h-6 mx-auto" color={palette?.accentColor || '#9C6644'} />
          </div>

          {/* Heading & Recipient */}
          <div className="z-10 my-2 px-2">
            <h2
              className={`font-serif tracking-[0.2em] uppercase text-xl sm:text-2xl font-light text-stone-800`}
            >
              Happy Birthday
            </h2>

            {/* Recipient Name in Handwritten Fountain Pen Script */}
            {recipientName ? (
              <p
                className={`mt-1 text-3xl sm:text-4xl ${selectedFont.class} font-bold drop-shadow-xs`}
                style={{ color: palette?.accentColor || '#B45339' }}
              >
                {recipientName}
              </p>
            ) : (
              <p className={`mt-1 text-2xl sm:text-3xl ${selectedFont.class} text-stone-400 italic`}>
                (Tên người nhận)
              </p>
            )}

            {/* Milestone Age Seal */}
            {age && (
              <div className="inline-block mt-1 px-3 py-0.5 rounded-full border border-stone-300 text-[11px] font-sans font-semibold text-stone-700 bg-stone-100/60">
                • {age} Tuổi Rực Rỡ •
              </div>
            )}
          </div>

          {/* Heartfelt Wish Letterpress Message (flawless Vietnamese typography) */}
          <div className="z-10 max-w-sm px-3 my-2">
            <p className="text-xs sm:text-sm font-sans font-normal italic text-stone-700 leading-relaxed">
              "{wishMessage || 'Chúc bạn một ngày sinh nhật thật ấm áp, bình an và ngập tràn những niềm vui giản dị nhất.'}"
            </p>
          </div>

          {/* Hand-drawn Illustrated Cake with Interactive Candles */}
          <div className="z-10 w-full mt-auto">
            <CandleBlowing
              count={candleCount}
              onAllBlown={handleAllBlown}
              palette={palette}
            />
          </div>

          {/* Watermark Signature */}
          <div className="z-10 w-full flex justify-end pt-1 pr-1">
            <Watermark />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      <EnvelopeAnimation
        isOpen={!!envelopeOpen}
        onOpen={handleOpenEnvelope}
        palette={palette}
        templateData={currentTemplate}
      >
        {cardContent}
      </EnvelopeAnimation>

      {/* Confetti Explosion Component */}
      <ConfettiCanvas trigger={confettiTrigger} intensity="medium" />
    </div>
  );
}
