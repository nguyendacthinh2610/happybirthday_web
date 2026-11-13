import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { COLOR_PALETTES, TEMPLATE_PALETTES } from '../data/colorPalettes';
import LZString from 'lz-string';
import { createMicroThumbnail } from '../utils/imageCompressor';

export const DEFAULT_SAMPLE_PHOTO = 'preset:flowers';

const DEFAULT_STATE = {
  recipientName: 'Tên người nhận',
  wishMessage:
    'Chúc bạn một ngày sinh nhật thật ấm áp, bình an và ngập tràn những niềm vui giản dị nhất.',
  wishStyle: 'emotional',
  template: 'botanical',
  paletteId: 'alabaster',
  fontFamily: 'charm',
  polaroidCaption: 'Kỷ niệm khó quên ✨',
  candleCount: 5,
  uploadedImage: DEFAULT_SAMPLE_PHOTO,
  candlesBlown: false,
  envelopeOpen: false,
  age: '--',
};

export function useCardState() {
  const [savedCards, setSavedCards] = useLocalStorage('birthday_saved_cards', []);
  const [workspaceTheme, setWorkspaceTheme] = useLocalStorage('birthday_studio_theme', 'light');

  const [cardState, setCardState] = useState(() => {
    // Check URL for shared card state
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('card');
    if (sharedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
        if (decompressed) {
          const decoded = JSON.parse(decompressed);
          let photo = decoded.uploadedImage;

          // Check localStorage for the original full HD photo (same browser / device)
          const localHdPhoto =
            (decoded.photoKey && window.localStorage.getItem(decoded.photoKey)) ||
            window.localStorage.getItem('birthday_shared_photo');

          if (localHdPhoto && (!photo || photo.startsWith('data:') || photo === DEFAULT_SAMPLE_PHOTO)) {
            photo = localHdPhoto;
          }

          return {
            ...DEFAULT_STATE,
            ...decoded,
            envelopeOpen: false,
            candlesBlown: false,
            uploadedImage: photo || DEFAULT_SAMPLE_PHOTO,
          };
        }
      } catch (e) {
        console.warn('Failed to decode shared card:', e);
      }
    }
    return DEFAULT_STATE;
  });

  const isViewMode = new URLSearchParams(window.location.search).has('card');

  const palette = COLOR_PALETTES.find((p) => p.id === cardState.paletteId) || COLOR_PALETTES[0];

  const toggleWorkspaceTheme = useCallback(() => {
    setWorkspaceTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setWorkspaceTheme]);

  const updateField = useCallback((field, value) => {
    setCardState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateTemplate = useCallback((templateId) => {
    const defaultPalette = TEMPLATE_PALETTES[templateId] || 'alabaster';
    setCardState((prev) => ({
      ...prev,
      template: templateId,
      paletteId: defaultPalette,
      candlesBlown: false,
      envelopeOpen: false,
    }));
  }, []);

  const resetCard = useCallback(() => {
    setCardState(DEFAULT_STATE);
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const saveCard = useCallback(() => {
    const cardToSave = {
      ...cardState,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      uploadedImage: cardState.uploadedImage,
    };
    setSavedCards((prev) => [cardToSave, ...prev].slice(0, 20));
    return cardToSave.id;
  }, [cardState, setSavedCards]);

  const loadCard = useCallback(
    (cardId) => {
      const card = savedCards.find((c) => c.id === cardId);
      if (card) {
        const { id, savedAt, ...rest } = card;
        setCardState({
          ...DEFAULT_STATE,
          ...rest,
          envelopeOpen: false,
          candlesBlown: false,
          uploadedImage: rest.uploadedImage || DEFAULT_SAMPLE_PHOTO,
        });
      }
    },
    [savedCards]
  );

  const deleteCard = useCallback(
    (cardId) => {
      setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
    },
    [setSavedCards]
  );

  const generateShareUrl = useCallback(async () => {
    // 1. Prepare photo for sharing
    let photoForUrl = cardState.uploadedImage || DEFAULT_SAMPLE_PHOTO;
    const photoKey = 'birthday_photo_' + Date.now();

    // Cache the original full HD photo in localStorage
    if (cardState.uploadedImage) {
      try {
        window.localStorage.setItem('birthday_shared_photo', cardState.uploadedImage);
        window.localStorage.setItem(photoKey, cardState.uploadedImage);
      } catch (e) {
        /* ignore localStorage quota if any */
      }
    }

    // 2. If it is a custom uploaded base64 image, generate an ultra-compact micro thumbnail (< 1.5 KB)
    // so the URL remains strictly under 2,000 characters (never triggers HTTP 431 or breaks in messengers)
    if (photoForUrl && photoForUrl.startsWith('data:image/')) {
      try {
        const micro = await createMicroThumbnail(photoForUrl, 120, 0.36);
        if (micro && micro.length < 3200) {
          photoForUrl = micro;
        } else {
          photoForUrl = 'preset:flowers';
        }
      } catch (err) {
        photoForUrl = 'preset:flowers';
      }
    }

    const shareData = {
      recipientName: cardState.recipientName,
      wishMessage: cardState.wishMessage,
      template: cardState.template,
      paletteId: cardState.paletteId,
      fontFamily: cardState.fontFamily,
      polaroidCaption: cardState.polaroidCaption,
      candleCount: cardState.candleCount,
      uploadedImage: photoForUrl,
      photoKey: photoKey,
      age: cardState.age,
    };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(shareData));
    return `${window.location.origin}${window.location.pathname}?card=${compressed}`;
  }, [cardState]);

  return {
    cardState,
    palette,
    workspaceTheme,
    toggleWorkspaceTheme,
    isViewMode,
    updateField,
    updateTemplate,
    resetCard,
    saveCard,
    loadCard,
    deleteCard,
    savedCards,
    generateShareUrl,
  };
}
