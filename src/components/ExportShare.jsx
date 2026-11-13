import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Copy, Check, Link, QrCode, Sparkles, X } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function ExportShare({ generateShareUrl, cardState }) {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [resolution, setResolution] = useState(2); // 2x or 3x HD

  const exportToPng = useCallback(async () => {
    const node = document.getElementById('birthday-card-capture');
    if (!node) return;
    setExporting(true);
    try {
      // Temporarily remove transform for crisp capture
      const originalTransform = node.style.transform;
      node.style.transform = 'none';

      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: resolution,
        cacheBust: true,
      });

      node.style.transform = originalTransform;

      const link = document.createElement('a');
      link.download = `thiep-sinh-nhat-${cardState.recipientName || 'happy-birthday'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [cardState.recipientName, resolution]);

  const handleGenerateAndCopy = useCallback(async () => {
    const url = generateShareUrl();
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [generateShareUrl]);

  const handleOpenQr = () => {
    if (!shareUrl) {
      const url = generateShareUrl();
      setShareUrl(url);
    }
    setShowQrModal(true);
  };

  const qrImageUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        shareUrl
      )}`
    : '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-studio px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white shadow-xl"
      >
        {/* Left Section: Export Controls */}
        <div className="flex items-center gap-2">
          {/* Resolution Badge */}
          <div className="hidden sm:flex items-center p-0.5 bg-black/30 rounded-lg border border-white/10 text-[11px] font-semibold">
            <button
              onClick={() => setResolution(2)}
              className={`px-2 py-1 rounded-md transition-all ${
                resolution === 2 ? 'bg-pink-500 text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              HD 2X
            </button>
            <button
              onClick={() => setResolution(3)}
              className={`px-2 py-1 rounded-md transition-all ${
                resolution === 3 ? 'bg-pink-500 text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              4K Ultra
            </button>
          </div>

          {/* Export PNG Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={exportToPng}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase shadow-lg text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
            }}
          >
            {exporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                />
                <span>Đang xuất ảnh...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Tải Ảnh PNG</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Right Section: Share Link & QR Code */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          {/* Share Link Copy Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerateAndCopy}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Đã sao chép link!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Tạo Link Chia Sẻ</span>
              </>
            )}
          </motion.button>

          {/* QR Code Quick Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenQr}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            title="Mã QR mở trên điện thoại"
          >
            <QrCode size={15} />
          </motion.button>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-studio p-6 rounded-3xl max-w-sm w-full text-center relative border border-white/20 text-white shadow-2xl"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="inline-flex p-3 rounded-2xl bg-white mb-3 shadow-lg">
                <img
                  src={qrImageUrl}
                  alt="QR Code to Card"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              <h3 className="text-base font-bold mb-1">Quét Mã QR Bằng Điện Thoại</h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                Người nhận có thể quét trực tiếp bằng camera điện thoại để trải nghiệm mở phong bì 3D và thổi nến!
              </p>

              <button
                onClick={handleGenerateAndCopy}
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg"
              >
                {copied ? 'Đã Sao Chép Link' : 'Sao Chép Link Trực Tiếp'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
