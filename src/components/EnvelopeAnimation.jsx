import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function EnvelopeAnimation({
  isOpen,
  onOpen,
  children,
  palette,
}) {
  const [sealPopped, setSealPopped] = useState(false);

  const handleClickOpen = () => {
    if (isOpen) return;
    setSealPopped(true);
    setTimeout(() => {
      onOpen();
    }, 380);
  };

  return (
    <div className="w-full flex justify-center py-2 select-none">
      <div className="relative w-full max-w-xl">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 1.03,
                y: -15,
                transition: { duration: 0.45, ease: 'easeInOut' },
              }}
              whileHover={{ scale: 1.015 }}
              onClick={handleClickOpen}
              className="cursor-pointer relative mx-auto w-[94%] sm:w-[500px] h-[330px] rounded-lg overflow-hidden border border-stone-300/60 shadow-[0_18px_45px_rgba(45,35,30,0.12)]"
              style={{
                backgroundColor: palette?.envelopeColor || '#F3EFE6',
              }}
            >
              {/* Envelope Inner Wall Gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(40,30,20,0.02), rgba(40,30,20,0.08))',
                }}
              />

              {/* Lower V-Pocket of Envelope */}
              <svg
                viewBox="0 0 500 240"
                className="absolute inset-x-0 bottom-0 w-full h-[180px] drop-shadow-[0_-3px_8px_rgba(0,0,0,0.06)]"
                preserveAspectRatio="none"
              >
                <polygon
                  points="0,240 500,240 250,55"
                  fill="#EFECE4"
                  stroke="rgba(43,37,35,0.08)"
                  strokeWidth="1"
                />
              </svg>

              {/* Left and Right Origami Folds */}
              <svg
                viewBox="0 0 500 330"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              >
                <polygon points="0,0 230,165 0,330" fill="#E8E4DA" opacity="0.6" />
                <polygon points="500,0 270,165 500,330" fill="#E8E4DA" opacity="0.75" />
              </svg>

              {/* Top Triangular Flap */}
              <motion.div
                className="absolute inset-x-0 top-0 origin-top z-30"
                animate={
                  sealPopped
                    ? {
                        rotateX: -160,
                        transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                      }
                    : { rotateX: 0 }
                }
              >
                <svg
                  viewBox="0 0 500 170"
                  className="w-full h-[145px] drop-shadow-[0_8px_14px_rgba(0,0,0,0.1)]"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,0 500,0 250,170"
                    fill="#F2EEE5"
                    stroke="rgba(43,37,35,0.12)"
                    strokeWidth="1"
                  />
                </svg>
              </motion.div>

              {/* Embossed Wax Seal (No childish emoji, authentic wax seal engraving) */}
              <div className="absolute inset-0 flex items-center justify-center z-40">
                <motion.div
                  className="relative flex items-center justify-center cursor-pointer"
                  animate={
                    sealPopped
                      ? { scale: 0, opacity: 0 }
                      : { scale: [1, 1.05, 1] }
                  }
                  transition={
                    sealPopped
                      ? { duration: 0.3 }
                      : { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
                  }
                >
                  {/* Real wax stamp with scalloped rim and intaglio botanical sprig */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_6px_18px_rgba(80,20,20,0.35)] border-2 border-[#D4A373]/50"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #9E2A2B, #6B1718)',
                    }}
                  >
                    <div className="w-12 h-12 rounded-full border border-dashed border-[#FDF0D5]/40 flex items-center justify-center shadow-inner">
                      {/* Botanical sprig engraving inside wax */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FDF0D5" strokeWidth="1.5">
                        <path d="M12 22 V6" strokeLinecap="round" />
                        <path d="M12 16 C8 13, 6 9, 9 7 C12 9, 12 13, 12 16 Z" fill="#FDF0D5" fillOpacity="0.4" />
                        <path d="M12 11 C16 8, 18 4, 15 2 C12 4, 12 8, 12 11 Z" fill="#FDF0D5" fillOpacity="0.4" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Call-to-action text */}
              <div className="absolute bottom-5 inset-x-0 flex justify-center z-30 pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-full bg-[#2B2523] text-[#FAF7F2] text-xs font-sans font-medium flex items-center gap-1.5 shadow-sm">
                  <Mail size={12} className="text-[#DDBEA9]" />
                  <span>Chạm để mở thiệp</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="openedCard"
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 260,
                duration: 0.6,
              }}
              className="w-full flex justify-center"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
