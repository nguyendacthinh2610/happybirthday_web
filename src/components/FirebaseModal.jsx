import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Check, AlertCircle, Trash2, Key } from 'lucide-react';
import { getFirebaseConfig, saveFirebaseConfig, isFirebaseConfigured } from '../services/firebase';

export default function FirebaseModal({ isOpen, onClose, onConfigSaved }) {
  const [configText, setConfigText] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getFirebaseConfig();
      if (current) {
        setConfigText(JSON.stringify(current, null, 2));
        setIsConfigured(true);
      } else {
        setIsConfigured(false);
      }
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSave = () => {
    setError('');
    setSuccess('');
    try {
      let parsed = null;
      // Handle standard JSON or JS object pasted from Firebase console
      const clean = configText.trim();
      if (!clean) {
        saveFirebaseConfig(null);
        setIsConfigured(false);
        setSuccess('Đã xóa cấu hình Firebase.');
        if (onConfigSaved) onConfigSaved(false);
        return;
      }

      if (clean.startsWith('{') && clean.endsWith('}')) {
        parsed = JSON.parse(clean);
      } else {
        // Try extracting keys
        const apiKey = clean.match(/apiKey:\s*["']([^"']+)["']/)?.[1];
        const storageBucket = clean.match(/storageBucket:\s*["']([^"']+)["']/)?.[1];
        const projectId = clean.match(/projectId:\s*["']([^"']+)["']/)?.[1];
        const authDomain = clean.match(/authDomain:\s*["']([^"']+)["']/)?.[1];
        const appId = clean.match(/appId:\s*["']([^"']+)["']/)?.[1];
        if (apiKey && storageBucket) {
          parsed = { apiKey, storageBucket, projectId, authDomain, appId };
        } else {
          throw new Error('Không tìm thấy apiKey và storageBucket hợp lệ.');
        }
      }

      if (!parsed.apiKey || !parsed.storageBucket) {
        throw new Error('Thiếu apiKey hoặc storageBucket trong cấu hình!');
      }

      saveFirebaseConfig(parsed);
      setIsConfigured(true);
      setSuccess('Đã lưu cấu hình Firebase Storage thành công!');
      if (onConfigSaved) onConfigSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Lỗi cấu hình: ' + (err.message || 'Dữ liệu không đúng định dạng'));
    }
  };

  const handleRemove = () => {
    saveFirebaseConfig(null);
    setConfigText('');
    setIsConfigured(false);
    setSuccess('Đã ngắt kết nối Firebase.');
    if (onConfigSaved) onConfigSaved(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-stone-900 border border-white/20 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Cloud size={20} className="text-amber-400" />
              <h3 className="text-base font-semibold font-sans">
                Lưu Ảnh Gốc Nét 100% Qua Firebase
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-300 mt-3 leading-relaxed">
            Dán <strong>firebaseConfig</strong> từ Firebase Console vào đây. Ảnh tải lên sẽ được lưu trực tiếp vào <strong>Firebase Storage</strong> của bạn ở độ phân giải gốc 100% (không bị mờ, không bị nén chất lượng).
          </p>

          {/* Status Badge */}
          <div className="mt-3">
            {isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Check size={12} /> Đang kết nối Firebase Storage
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertCircle size={12} /> Chưa cấu hình (Đang dùng bộ nén URL nội bộ)
              </span>
            )}
          </div>

          {/* Text Area */}
          <div className="mt-3">
            <label className="text-[11px] font-mono text-stone-400 block mb-1">
              Dán firebaseConfig JSON:
            </label>
            <textarea
              rows={6}
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "storageBucket": "your-app.firebasestorage.app",\n  "projectId": "your-project-id"\n}`}
              className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl font-mono text-xs text-amber-200/90 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Alert feedback */}
          {error && (
            <div className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
              <Check size={14} /> {success}
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            {isConfigured ? (
              <button
                onClick={handleRemove}
                className="px-3 py-2 rounded-xl text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={13} /> Ngắt kết nối
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs bg-white/10 hover:bg-white/15 text-stone-300 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <Check size={14} /> Lưu cấu hình
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
