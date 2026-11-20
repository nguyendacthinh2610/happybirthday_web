import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenLine,
  Palette,
  Camera,
  Flame,
  Share2,
  Bookmark,
  X,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  QrCode,
  Trash2,
  Cloud,
} from 'lucide-react';
import { COLOR_PALETTES } from '../data/colorPalettes';
import { CARD_TEMPLATES, FONT_OPTIONS } from '../data/templates';
import { WISH_STYLES, generateWish } from '../data/wishTemplates';
import { toPng } from 'html-to-image';
import { compressImage } from '../utils/imageCompressor';
import { SAMPLE_PRESETS } from '../data/samplePhotos';
import { copyTextToClipboard } from '../utils/clipboard';
import FirebaseModal from './FirebaseModal';
import { isFirebaseConfigured, uploadImageToFirebase } from '../services/firebase';
import { uploadToFreeCloud } from '../services/cloudImage';

export default function FloatingPillBar({
  cardState,
  palette,
  updateField,
  updateTemplate,
  resetCard,
  saveCard,
  savedCards,
  loadCard,
  deleteCard,
  generateShareUrl,
}) {
  const [activePopover, setActivePopover] = useState(null); // 'write' | 'palette' | 'photo' | 'candles' | 'share' | 'saved' | null
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [resolution, setResolution] = useState(2);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(isFirebaseConfigured());
  const fileInputRef = useRef(null);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !e.target.closest('#stationery-pill-bar')
      ) {
        setActivePopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopover = (key) => {
    setActivePopover((curr) => (curr === key ? null : key));
  };

  /* ── Export to PNG ── */
  const exportToPng = async () => {
    const node = document.getElementById('birthday-card-capture');
    if (!node) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: resolution,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `thiep-sinh-nhat-${cardState.recipientName || 'artisan'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  /* ── Copy share URL with universal fallback ── */
  const handleCopyLink = async () => {
    setGeneratingLink(true);
    try {
      const url = await generateShareUrl();
      setShareUrl(url);
      const ok = await copyTextToClipboard(url);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2600);
      }
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleGenerateWishTone = (styleId) => {
    const text = generateWish(styleId, cardState.recipientName);
    updateField('wishMessage', text);
  };

  const qrImageUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      shareUrl
    )}`
    : '';

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          POPOVER FLOATING CARD (Xuất hiện phía trên Pill-bar trên PC, Bottom Sheet trên Điện Thoại)
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activePopover && (
          <>
            {/* Mobile / Desktop Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePopover(null)}
              className="fixed inset-0 bg-stone-900/35 backdrop-blur-[2px] z-40 transition-opacity"
            />

            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 sm:bottom-24 sm:left-1/2 sm:-translate-x-1/2 z-50 w-full sm:w-[480px] max-h-[85vh] sm:max-h-[82vh] overflow-y-auto stationery-popover rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 pb-8 sm:pb-5 shadow-[0_-12px_40px_rgba(0,0,0,0.22)] select-none"
            >
              {/* Mobile Sheet Drag Indicator Handle */}
              <div
                onClick={() => setActivePopover(null)}
                className="w-12 h-1.5 bg-stone-300 hover:bg-stone-400 rounded-full mx-auto mb-3 sm:hidden cursor-pointer"
                title="Kéo hoặc nhấp để đóng"
              />

              {/* Popover Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 mb-3.5">
                <h3 className="text-xs font-sans font-bold text-stone-800 tracking-wide uppercase">
                  {activePopover === 'write' && 'Viết Lời Chúc & Tên Người Nhận'}
                  {activePopover === 'palette' && 'Chất Liệu Giấy & Bảng Màu Tối Giản'}
                  {activePopover === 'photo' && 'Khung Ảnh Polaroid & Washi Tape'}
                  {activePopover === 'candles' && 'Số Lượng Ngọn Nến Trên Bánh'}
                  {activePopover === 'share' && 'Xuất Thiệp In & Chia Sẻ Trực Tiếp'}
                  {activePopover === 'saved' && 'Bộ Sưu Tập Thiệp Đã Lưu'}
                </h3>
                <button
                  onClick={() => setActivePopover(null)}
                  className="p-1 rounded-full hover:bg-stone-200/60 text-stone-500 hover:text-stone-800 transition-colors"
                  title="Đóng bảng chỉnh"
                >
                  <X size={16} />
                </button>
              </div>

              {/* POPOVER 1: VIẾT THIỆP */}
              {activePopover === 'write' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label className="text-[11px] font-sans font-semibold text-stone-600 block mb-1">
                        Tên Người Nhận
                      </label>
                      <input
                        type="text"
                        value={cardState.recipientName}
                        onChange={(e) => updateField('recipientName', e.target.value)}
                        placeholder="VD: Minh Thư, Hoàng Nam..."
                        className="editorial-input"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-sans font-semibold text-stone-600 block mb-1">
                        Số Tuổi
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={cardState.age || ''}
                        onChange={(e) => updateField('age', e.target.value)}
                        placeholder="24"
                        className="editorial-input"
                      />
                    </div>
                  </div>

                  {/* Font Selector (Clean 4-column grid) */}
                  <div>
                    <label className="text-[11px] font-sans font-semibold text-stone-600 block mb-1.5">
                      Kiểu Chữ Viết Tay
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => updateField('fontFamily', f.id)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            (cardState.fontFamily || 'charm') === f.id
                              ? 'border-stone-800 bg-stone-900 text-stone-100 shadow-xs'
                              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="text-[10px] font-sans font-medium truncate opacity-75">{f.name.split(' ')[0]}</div>
                          <div className={`text-sm ${f.class} truncate mt-0.5`}>{f.preview}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone Chips for Wish Generation */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-sans font-semibold text-stone-600">
                        Gợi Ý Lời Chúc Mẫu (Bấm để tạo tự động)
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {WISH_STYLES.map((ws) => (
                        <button
                          key={ws.id}
                          onClick={() => handleGenerateWishTone(ws.id)}
                          className="px-2.5 py-1 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-800 text-xs font-sans transition-colors flex items-center gap-1 active:scale-95"
                        >
                          <Sparkles size={11} className="text-[#B45339]" />
                          <span>{ws.label}</span>
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={3}
                      value={cardState.wishMessage}
                      onChange={(e) => updateField('wishMessage', e.target.value)}
                      placeholder="Viết lời chúc từ trái tim của bạn..."
                      className="editorial-input resize-none font-sans leading-relaxed"
                    />
                  </div>

                  {/* Mobile Done Button */}
                  <div className="pt-2 sm:hidden">
                    <button
                      onClick={() => setActivePopover(null)}
                      className="w-full py-2.5 bg-[#2B2523] text-[#FAF7F2] rounded-xl text-xs font-sans font-semibold tracking-wider uppercase shadow-sm"
                    >
                      Xong & Xem Thiệp
                    </button>
                  </div>
                </div>
              )}

            {/* POPOVER 2: GIẤY & MÀU (MINIMAL COLOR DOTS) */}
            {activePopover === 'palette' && (
              <div className="space-y-4">
                {/* Minimal Color Dots Picker */}
                <div>
                  <label className="text-[11px] font-sans text-[11px] font-semibold text-stone-600 block mb-2">
                    Bảng Màu Giấy Nghệ Thuật (Minimal Dots)
                  </label>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200/80">
                    {COLOR_PALETTES.map((p) => {
                      const isSelected = cardState.paletteId === p.id;
                      return (
                        <div key={p.id} className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => updateField('paletteId', p.id)}
                            className={`color-dot ${isSelected ? 'active' : ''}`}
                            style={{ backgroundColor: p.dotColor }}
                            title={p.name}
                          />
                          <span className="text-[9px] font-sans text-stone-600 line-clamp-1 max-w-[50px] text-center">
                            {p.name.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stationery Style Presets */}
                <div>
                  <label className="text-[11px] font-sans text-[11px] font-semibold text-stone-600 block mb-2">
                    Phong Cách Thiệp
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CARD_TEMPLATES.map((tmpl) => {
                      const isSelected = cardState.template === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          onClick={() => updateTemplate(tmpl.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${isSelected
                              ? 'border-stone-800 bg-stone-900 text-stone-100 shadow-sm'
                              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                            }`}
                        >
                          <div className="text-xs font-sans font-bold">{tmpl.name}</div>
                          <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                            {tmpl.subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* POPOVER 3: ẢNH POLAROID */}
            {activePopover === 'photo' && (
              <div className="space-y-4">
                {/* 4 Artistic SVG Presets */}
                <div>
                  <label className="text-[11px] font-sans font-semibold text-stone-600 block mb-2">
                    Bộ Ảnh Mẫu Vẽ Tay Mỹ Thuật (Tải tức thì, không lỗi mạng)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_PRESETS.map((preset) => {
                      const isSelected = cardState.uploadedImage === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            updateField('uploadedImage', preset.id);
                            if (
                              !cardState.polaroidCaption ||
                              cardState.polaroidCaption === 'Kỷ niệm khó quên ✨'
                            ) {
                              updateField('polaroidCaption', preset.caption);
                            }
                          }}
                          className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'border-stone-800 bg-stone-100 shadow-sm ring-1 ring-stone-800'
                              : 'border-stone-200 bg-white hover:border-stone-400'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 border border-stone-200/80 bg-stone-50">
                            {preset.render()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-sans font-semibold text-stone-800 truncate">
                              {preset.name}
                            </div>
                            <div className="text-[9px] font-sans text-stone-400 truncate">
                              {preset.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Photo Upload */}
                <div className="pt-2 border-t border-stone-200">
                  <label className="text-[11px] font-sans font-semibold text-stone-600 block mb-1.5">
                    Hoặc Tải Lên Ảnh Riêng Của Bạn
                  </label>
                  {cardState.uploadedImage && !cardState.uploadedImage.startsWith('preset:') ? (
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-stone-200">
                      <img
                        src={cardState.uploadedImage}
                        alt="Thumbnail"
                        className="w-12 h-12 rounded-md object-cover border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-sans font-semibold text-stone-800">
                          Ảnh kỷ niệm riêng của bạn
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Đã đính vào khung Polaroid cánh trái
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 text-xs font-sans bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md"
                        >
                          Đổi
                        </button>
                        <button
                          onClick={() => updateField('uploadedImage', 'preset:flowers')}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                          title="Dùng lại ảnh mẫu nghệ thuật"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-stone-300 hover:border-stone-600 bg-white p-3.5 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Upload size={16} className="text-stone-400" />
                      <div className="text-xs font-sans text-stone-700 font-medium">
                        Nhấp để tải ảnh từ máy tính hoặc điện thoại
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const compressed = await compressImage(file, 960, 0.9);
                        if (compressed) {
                          updateField('uploadedImage', compressed);
                        }
                        if (isFirebaseConfigured()) {
                          uploadImageToFirebase(file)
                            .then((fireUrl) => {
                              if (fireUrl) updateField('uploadedImage', fireUrl);
                            })
                            .catch((err) => console.warn('Firebase upload error:', err));
                        } else {
                          uploadToFreeCloud(compressed || file)
                            .then((cloudUrl) => {
                              if (cloudUrl) updateField('uploadedImage', cloudUrl);
                            })
                            .catch((err) => console.warn('Free cloud upload fallback:', err));
                        }
                      } catch (err) {
                        console.warn('Failed to compress image:', err);
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />

                  {/* Firebase Cloud Option for 100% Original Quality */}
                  <div className="mt-2.5 p-2 bg-stone-100 rounded-lg flex items-center justify-between border border-stone-200/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-700">
                      <Cloud size={13} className={firebaseReady ? 'text-emerald-600' : 'text-amber-600'} />
                      <span className="font-sans">
                        {firebaseReady ? 'Firebase: Ảnh nét 100% 4K' : 'Chất lượng ảnh: Nén sắc nét (320px)'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowFirebaseModal(true)}
                      className="text-[10px] text-amber-800 hover:text-amber-900 font-semibold underline font-sans"
                    >
                      {firebaseReady ? 'Cài đặt' : 'Dùng Firebase'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-sans font-semibold text-stone-600 block mb-1.5">
                    Dòng Chữ Chú Thích Viết Tay Dưới Ảnh
                  </label>
                  <input
                    type="text"
                    value={cardState.polaroidCaption || ''}
                    onChange={(e) => updateField('polaroidCaption', e.target.value)}
                    placeholder="VD: Kỷ niệm khó quên ✨"
                    className="editorial-input font-charm text-base"
                  />
                </div>
              </div>
            )}

            {/* POPOVER 4: NẾN TRÊN BÁNH */}
            {activePopover === 'candles' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-sans text-[11px] font-semibold text-stone-600">
                      Số Lượng Nến Sáp
                    </label>
                    <span className="text-xs font-sans font-bold text-stone-800">
                      {cardState.candleCount || 5} ngọn nến
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={cardState.candleCount || 5}
                    onChange={(e) => updateField('candleCount', Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-[#2B2523]"
                  />
                  <div className="flex justify-between text-[10px] font-sans text-stone-400 mt-1">
                    <span>1 nến</span>
                    <span>5 nến</span>
                    <span>9 nến</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200/80 text-xs font-sans text-stone-700 leading-relaxed">
                  💡 Bạn có thể thổi tắt nến bằng cách nhấp chuột trực tiếp vào từng ngọn lửa hoặc bấm nút{' '}
                  <span className="font-semibold text-stone-900">Thổi Bằng Mic</span> rồi thổi mạnh vào micro của thiết bị!
                </div>
              </div>
            )}

            {/* POPOVER 5: CHIA SẺ & XUẤT */}
            {activePopover === 'share' && (
              <div className="space-y-4">
                {/* PNG Download */}
                <div>
                  <label className="text-[11px] font-sans text-[11px] font-semibold text-stone-600 block mb-2">
                    Tải Ảnh Thiệp Mỹ Thuật Về Máy
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex p-0.5 bg-stone-200/80 rounded-lg text-xs font-sans">
                      <button
                        onClick={() => setResolution(2)}
                        className={`px-2.5 py-1 rounded-md transition-all ${resolution === 2 ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                          }`}
                      >
                        HD 2X
                      </button>
                      <button
                        onClick={() => setResolution(3)}
                        className={`px-2.5 py-1 rounded-md transition-all ${resolution === 3 ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                          }`}
                      >
                        4K Ultra
                      </button>
                    </div>

                    <button
                      onClick={exportToPng}
                      disabled={exporting}
                      className="flex-1 py-1.5 px-3 bg-[#2B2523] hover:bg-[#3D3532] text-[#FAF7F2] rounded-lg text-xs font-sans tracking-wider uppercase font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Download size={13} />
                      <span>{exporting ? 'Đang xuất...' : 'Tải Ảnh PNG'}</span>
                    </button>
                  </div>
                </div>

                {/* Share Link & QR */}
                <div className="pt-2 border-t border-stone-200">
                  <label className="text-[11px] font-sans font-semibold text-stone-600 block mb-2">
                    Tạo Đường Link Để Người Nhận Mở Xem Trực Tiếp
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      disabled={generatingLink}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                        copied
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                          : 'bg-stone-200/80 hover:bg-stone-200 text-stone-800 border-stone-300'
                      }`}
                    >
                      {generatingLink ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                          <span>Đang tạo link ngắn...</span>
                        </>
                      ) : copied ? (
                        <>
                          <Check size={13} className="text-white" />
                          <span>Đã sao chép link thành công!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={13} />
                          <span>Sao chép link thiệp</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={async () => {
                        if (!shareUrl) {
                          const url = await generateShareUrl();
                          setShareUrl(url);
                        }
                        setShowQr(!showQr);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        showQr
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-stone-200/80 hover:bg-stone-200 text-stone-800 border-stone-300'
                      }`}
                      title="Mã QR xem trên điện thoại"
                    >
                      <QrCode size={15} />
                    </button>
                  </div>

                  {/* Share URL text box for 100% fail-proof copy */}
                  {shareUrl && (
                    <div className="mt-2.5 p-2 bg-white rounded-lg border border-stone-200">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          onFocus={(e) => e.target.select()}
                          className="w-full text-[11px] font-mono text-stone-700 bg-stone-50 px-2 py-1 rounded border border-stone-200 focus:outline-none select-all"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="px-2.5 py-1 bg-[#2B2523] text-white rounded text-[11px] font-sans font-medium hover:bg-stone-700 transition-colors whitespace-nowrap"
                        >
                          {copied ? 'Đã chép' : 'Chép'}
                        </button>
                      </div>
                      <div className="text-[10px] font-sans text-stone-400 mt-1 flex items-center justify-between">
                        <span>Gửi qua Zalo, Messenger, SMS để người nhận mở xem</span>
                        <span className="text-[9px] text-emerald-700 font-semibold">Tương thích mọi máy</span>
                      </div>
                    </div>
                  )}

                  {/* QR Code preview */}
                  {showQr && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 flex flex-col items-center text-center">
                      <img
                        src={qrImageUrl}
                        alt="QR Code"
                        className="w-36 h-36 rounded-md mb-2 border border-stone-100"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="text-[10px] font-sans text-stone-600 font-medium">
                        Quét mã QR bằng camera điện thoại để mở thiệp trực tiếp
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* POPOVER 6: THIỆP ĐÃ LƯU */}
            {activePopover === 'saved' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-stone-600">
                    Đã lưu {savedCards.length} thiệp trong máy
                  </span>
                  <button
                    onClick={() => {
                      saveCard();
                      setActivePopover(null);
                    }}
                    className="px-2.5 py-1 bg-[#2B2523] text-[#FAF7F2] rounded-md text-xs font-sans"
                  >
                    Lưu thiệp này
                  </button>
                </div>

                {savedCards.length === 0 ? (
                  <div className="p-6 text-center text-xs font-sans text-stone-400 bg-white rounded-xl border border-stone-200">
                    Chưa có thiệp nào được lưu. Bấm "Lưu thiệp này" để cất giữ vào bộ nhớ máy!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {savedCards.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-sans font-bold text-stone-800 truncate">
                            Gửi: {c.recipientName || 'Bạn thân'}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {new Date(c.savedAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              loadCard(c.id);
                              setActivePopover(null);
                            }}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-sans rounded"
                          >
                            Mở
                          </button>
                          <button
                            onClick={() => deleteCard(c.id)}
                            className="p-1 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          FLOATING BOTTOM PILL-BAR (Figma / Apple Dock style)
          ═══════════════════════════════════════════════════════ */}
      <div
        id="stationery-pill-bar"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none max-w-[96%] sm:max-w-max"
      >
        <div className="floating-pill-bar px-2 sm:px-2.5 py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-xl">
          {/* Pill 1: Viết Thiệp */}
          <button
            onClick={() => togglePopover('write')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              activePopover === 'write'
                ? 'bg-[#2B2523] text-[#FAF7F2] shadow-sm'
                : 'text-stone-700 hover:bg-stone-200/50'
            }`}
          >
            <PenLine size={13} />
            <span className="sm:hidden text-[11px]">Viết</span>
            <span className="hidden sm:inline">Viết thiệp</span>
          </button>

          {/* Pill 2: Giấy & Màu */}
          <button
            onClick={() => togglePopover('palette')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              activePopover === 'palette'
                ? 'bg-[#2B2523] text-[#FAF7F2] shadow-sm'
                : 'text-stone-700 hover:bg-stone-200/50'
            }`}
          >
            <Palette size={13} />
            <span className="sm:hidden text-[11px]">Màu</span>
            <span className="hidden sm:inline">Giấy & Màu</span>
          </button>

          {/* Pill 3: Ảnh Polaroid */}
          <button
            onClick={() => togglePopover('photo')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              activePopover === 'photo'
                ? 'bg-[#2B2523] text-[#FAF7F2] shadow-sm'
                : 'text-stone-700 hover:bg-stone-200/50'
            }`}
          >
            <Camera size={13} />
            <span className="sm:hidden text-[11px]">Ảnh</span>
            <span className="hidden sm:inline">Ảnh Polaroid</span>
          </button>

          {/* Pill 4: Nến */}
          <button
            onClick={() => togglePopover('candles')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              activePopover === 'candles'
                ? 'bg-[#2B2523] text-[#FAF7F2] shadow-sm'
                : 'text-stone-700 hover:bg-stone-200/50'
            }`}
          >
            <Flame size={13} />
            <span className="text-[11px] sm:text-xs">Nến</span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-stone-300/80 mx-0.5" />

          {/* Pill 5: Chia Sẻ & Xuất */}
          <button
            onClick={() => togglePopover('share')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              activePopover === 'share'
                ? 'bg-[#2B2523] text-[#FAF7F2] shadow-sm'
                : 'text-stone-700 hover:bg-stone-200/50'
            }`}
          >
            <Share2 size={13} />
            <span className="sm:hidden text-[11px]">Chia sẻ</span>
            <span className="hidden sm:inline">Chia sẻ & Xuất</span>
          </button>

          {/* Pill 6: Đã Lưu */}
          <button
            onClick={() => togglePopover('saved')}
            className={`p-1.5 rounded-full transition-all text-stone-600 hover:bg-stone-200/50 ${
              activePopover === 'saved' ? 'bg-[#2B2523] text-[#FAF7F2]' : ''
            }`}
            title="Thiệp đã lưu"
          >
            <Bookmark size={14} />
          </button>

          {/* Pill 7: Reset */}
          <button
            onClick={resetCard}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Đặt lại ban đầu"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Firebase Storage Configuration Modal */}
      <FirebaseModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        onConfigSaved={(ready) => setFirebaseReady(ready)}
      />
    </>
  );
}

