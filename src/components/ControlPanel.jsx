import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Type,
  Image as ImageIcon,
  Sparkles,
  Flame,
  Save,
  Trash2,
  RotateCcw,
  Upload,
  Check,
  FolderHeart,
  Sliders,
  Layers,
  Wand2,
  Smile,
  X,
  Plus,
} from 'lucide-react';
import { CARD_TEMPLATES, FONT_OPTIONS } from '../data/templates';
import { COLOR_PALETTES } from '../data/colorPalettes';
import { WISH_STYLES, generateWish } from '../data/wishTemplates';
import { STICKERS } from '../data/stickers';
import { compressImage } from '../utils/imageCompressor';
import { isFirebaseConfigured, uploadImageToFirebase } from '../services/firebase';
import { uploadToFreeCloud } from '../services/cloudImage';

const TABS = [
  { id: 'design', label: 'Thiết Kế', icon: Palette },
  { id: 'content', label: 'Nội Dung', icon: Type },
  { id: 'media', label: 'Ảnh & Sticker', icon: ImageIcon },
  { id: 'effects', label: 'Hiệu Ứng', icon: Sparkles },
  { id: 'saved', label: 'Bộ Sưu Tập', icon: FolderHeart },
];

export default function ControlPanel({
  cardState,
  palette,
  updateField,
  updateTemplate,
  addSticker,
  removeSticker,
  resetCard,
  saveCard,
  savedCards = [],
  loadCard,
  deleteCard,
}) {
  const [activeTab, setActiveTab] = useState('design');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  /* ── Image Upload Handling ── */
  const handleFile = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith('image/')) return;
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
        console.warn('Image processing error:', err);
      }
    },
    [updateField]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleGenerateWish = (styleId) => {
    updateField('wishStyle', styleId);
    const generated = generateWish(styleId, cardState.recipientName);
    updateField('wishMessage', generated);
  };

  const handleSave = () => {
    saveCard();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="glass-studio w-full flex flex-col p-4 sm:p-5 text-white overflow-hidden shadow-2xl border border-white/15">
      {/* ── Segmented Control Tabs Navigation ── */}
      <div className="relative flex items-center p-1 bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 mb-5 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 min-w-[70px] py-2 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors z-10 ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white/90'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/80 to-purple-600/80 rounded-lg shadow-md border border-white/20"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <Icon size={14} className="relative z-10" />
              <span className="relative z-10 truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Area ── */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[calc(100vh-250px)] space-y-5">
        <AnimatePresence mode="wait">
          {/* TAB 1: THIẾT KẾ (TEMPLATES & THEMES) */}
          {activeTab === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Template Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2.5 flex items-center gap-1.5">
                  <Layers size={13} className="text-pink-400" />
                  Phong Cách Thiệp
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CARD_TEMPLATES.map((tmpl) => {
                    const isSelected = cardState.template === tmpl.id;
                    return (
                      <motion.button
                        key={tmpl.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateTemplate(tmpl.id)}
                        className={`p-3 rounded-xl text-left border transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-pink-400 bg-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-sm font-bold text-white mb-0.5">
                          {tmpl.name}
                        </div>
                        <div className="text-[11px] text-white/60 line-clamp-1">
                          {tmpl.description}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palettes Swatches */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2.5 flex items-center gap-1.5">
                  <Palette size={13} className="text-pink-400" />
                  Bảng Màu Chủ Đạo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PALETTES.map((p) => {
                    const isSelected = cardState.paletteId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => updateField('paletteId', p.id)}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all ${
                          isSelected
                            ? 'border-white bg-white/15 scale-105 shadow-lg'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-full h-7 rounded-lg shadow-inner flex items-center justify-center"
                          style={{ background: p.envelopeBg || p.primary }}
                        >
                          {isSelected && <Check size={12} className="text-white drop-shadow" />}
                        </div>
                        <span className="text-[11px] font-medium text-white/80 truncate w-full text-center">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography Font Picker */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2.5 flex items-center gap-1.5">
                  <Type size={13} className="text-pink-400" />
                  Font Chữ Nghệ Thuật
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_OPTIONS.map((f) => {
                    const isSelected = (cardState.fontFamily || 'handwriting') === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => updateField('fontFamily', f.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-pink-400 bg-pink-500/15 text-pink-300'
                            : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-bold">{f.name}</div>
                        <div className={`text-base mt-1 ${f.class} text-white truncate`}>
                          {f.preview}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3D Realism Toggles */}
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      3D Tilt Parallax Effect
                    </span>
                    <span className="text-[10px] text-white/50">
                      Nghiêng thiệp theo chuyển động chuột
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cardState.tiltEnabled !== false}
                    onChange={(e) => updateField('tiltEnabled', e.target.checked)}
                    className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Vân Giấy Paper Grain Texture
                    </span>
                    <span className="text-[10px] text-white/50">
                      Hiệu ứng kết cấu sần giấy mỹ thuật
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cardState.paperTexture !== false}
                    onChange={(e) => updateField('paperTexture', e.target.checked)}
                    className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: NỘI DUNG (CONTENT & WISHES) */}
          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Recipient Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  Tên Người Nhận
                </label>
                <input
                  type="text"
                  value={cardState.recipientName}
                  onChange={(e) => updateField('recipientName', e.target.value)}
                  placeholder="Nhập tên người bạn muốn chúc mừng..."
                  className="input-field"
                />
              </div>

              {/* Milestone Age */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  Số Tuổi (Tùy chọn)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cardState.age || ''}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="VD: 18, 25..."
                    className="input-field w-32"
                  />
                  <span className="text-xs text-white/50">Hiển thị bóng bay & tuổi trên thiệp</span>
                </div>
              </div>

              {/* Wish Message Generator by AI Style */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Wand2 size={13} className="text-amber-400" />
                    Tạo Lời Chúc Tự Động Theo Phong Cách
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {WISH_STYLES.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => handleGenerateWish(ws.id)}
                      className="py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-white transition-all text-center"
                    >
                      {ws.label}
                    </button>
                  ))}
                </div>

                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  Nội Dung Lời Chúc
                </label>
                <textarea
                  rows={4}
                  value={cardState.wishMessage}
                  onChange={(e) => updateField('wishMessage', e.target.value)}
                  placeholder="Nhập lời chúc từ trái tim hoặc chọn nút tạo tự động ở trên..."
                  className="input-field resize-none leading-relaxed"
                />
              </div>

              {/* Polaroid Photo Caption */}
              {cardState.uploadedImage && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Chú Thích Dưới Ảnh Polaroid
                  </label>
                  <input
                    type="text"
                    value={cardState.polaroidCaption || ''}
                    onChange={(e) => updateField('polaroidCaption', e.target.value)}
                    placeholder="VD: Chuyến đi Đà Lạt đáng nhớ ✨"
                    className="input-field"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: ẢNH & STICKER (MEDIA) */}
          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Polaroid Photo Upload Zone */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2 flex items-center gap-1.5">
                  <ImageIcon size={13} className="text-pink-400" />
                  Ảnh Kỷ Niệm (Khung Polaroid & Washi Tape)
                </label>

                {cardState.uploadedImage ? (
                  <div className="relative p-3 bg-white/10 rounded-2xl border border-white/20 flex items-center gap-3">
                    <img
                      src={cardState.uploadedImage}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-lg object-cover shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">Ảnh đã tải lên</div>
                      <div className="text-[11px] text-white/50 truncate">
                        Sẵn sàng trong khung Polaroid
                      </div>
                    </div>
                    <button
                      onClick={() => updateField('uploadedImage', null)}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors"
                      title="Xóa ảnh"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={onDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      dragOver
                        ? 'border-pink-400 bg-pink-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Upload size={24} className="mx-auto mb-2 text-pink-400" />
                    <p className="text-xs font-semibold text-white">
                      Kéo thả ảnh hoặc nhấp để chọn
                    </p>
                    <p className="text-[10px] text-white/50 mt-1">PNG, JPG, WEBP tối đa 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </div>
                )}
              </div>

              {/* Sticker Emoji Grid */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2 flex items-center gap-1.5">
                  <Smile size={13} className="text-amber-400" />
                  Thêm Nhãn Dán / Stickers Sinh Nhật
                </label>
                <div className="grid grid-cols-6 gap-2 p-3 bg-white/5 rounded-2xl border border-white/10 max-h-48 overflow-y-auto">
                  {STICKERS.map((s) => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => addSticker(s)}
                      className="text-2xl p-1.5 rounded-lg hover:bg-white/15 transition-colors flex items-center justify-center"
                      title={s.label}
                    >
                      {s.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Active Placed Stickers Management */}
              {cardState.selectedStickers?.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Stickers Đã Thêm ({cardState.selectedStickers.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {cardState.selectedStickers.map((s) => (
                      <span
                        key={s.instanceId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white"
                      >
                        <span>{s.emoji}</span>
                        <button
                          onClick={() => removeSticker(s.instanceId)}
                          className="hover:text-red-400 transition-colors ml-1"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: HIỆU ỨNG (EFFECTS & CANDLES) */}
          {activeTab === 'effects' && (
            <motion.div
              key="effects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Candle Count Slider */}
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" />
                    Số Lượng Ngọn Nến: {cardState.candleCount || 5}
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={cardState.candleCount || 5}
                  onChange={(e) => updateField('candleCount', Number(e.target.value))}
                  className="studio-slider"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>1 nến</span>
                  <span>5 nến</span>
                  <span>9 nến</span>
                </div>
              </div>

              {/* Quick instructions for blowing */}
              <div className="p-3.5 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-white/15 space-y-2">
                <div className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Cách Thổi Nến Tương Tác
                </div>
                <ul className="text-xs text-white/80 space-y-1 list-disc list-inside">
                  <li>
                    <span className="font-semibold text-white">Cách 1:</span> Nhấp trực tiếp vào từng ngọn nến trên bánh kem.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Cách 2:</span> Bấm nút{' '}
                    <span className="underline font-semibold text-emerald-300">Thổi Bằng Mic</span> và thổi mạnh vào micro của máy tính hoặc điện thoại!
                  </li>
                  <li>
                    Khi tất cả nến tắt, pháo giấy <span className="text-pink-300 font-semibold">Canvas Confetti</span> sẽ tự động bắn tung tóe ăn mừng!
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* TAB 5: BỘ SƯU TẬP (SAVED CARDS IN LOCAL STORAGE) */}
          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Thiệp Đã Lưu ({savedCards.length})
                </span>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-pink-500 hover:bg-pink-600 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow"
                >
                  <Save size={12} />
                  <span>{saveSuccess ? 'Đã lưu!' : 'Lưu thiệp hiện tại'}</span>
                </button>
              </div>

              {savedCards.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-white/40 text-xs">
                  Chưa có thiệp nào được lưu trong bộ nhớ máy. Nhấn "Lưu thiệp hiện tại" để lưu lại thiệp của bạn!
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {savedCards.map((sc) => (
                    <div
                      key={sc.id}
                      className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-3 hover:bg-white/15 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          Gửi: {sc.recipientName || 'Bạn bè'}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {new Date(sc.savedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => loadCard(sc.id)}
                          className="px-2.5 py-1 rounded-lg bg-pink-500/30 hover:bg-pink-500/50 text-pink-200 text-xs font-medium"
                        >
                          Mở
                        </button>
                        <button
                          onClick={() => deleteCard(sc.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Studio Bottom Bar: Quick Reset ── */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <button
          onClick={resetCard}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
        >
          <RotateCcw size={13} />
          <span>Đặt lại ban đầu</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
          <Save size={13} />
          <span>{saveSuccess ? 'Đã lưu ✓' : 'Lưu vào máy'}</span>
        </button>
      </div>
    </div>
  );
}
