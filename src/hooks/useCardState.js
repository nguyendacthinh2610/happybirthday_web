import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { COLOR_PALETTES, TEMPLATE_PALETTES } from '../data/colorPalettes';
import LZString from 'lz-string';
import { createMicroThumbnail } from '../utils/imageCompressor';
import { shortenUrl } from '../utils/urlShortener';
import {
  isFirebaseConfigured,
  saveCardToFirestore,
  getCardFromFirestore,
  uploadImageToFirebase,
} from '../services/firebase';
import { uploadToFreeCloud } from '../services/cloudImage';

export const DEFAULT_SAMPLE_PHOTO = 'preset:flowers';

/**
 * Extracts card reference:
 * - { type: 'firestore', value: id } for ?id=xyz or #id=xyz
 * - { type: 'compressed', value: lzString } for #c=xyz, #card=xyz, ?c=xyz, ?card=xyz
 */
export function getSharedCardParam() {
  if (typeof window === 'undefined') return { type: null, value: null };

  const searchParams = new URLSearchParams(window.location.search);
  const idFromSearch = searchParams.get('id');
  if (idFromSearch) {
    return { type: 'firestore', value: idFromSearch };
  }

  // 1. Prioritize URL Hash (#id=... or #c=... or #card=...)
  if (window.location.hash) {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash.startsWith('id=')) {
      return { type: 'firestore', value: hash.slice(3) };
    }
    if (hash.startsWith('c=')) {
      return { type: 'compressed', value: decodeURIComponent(hash.slice(2)) };
    }
    if (hash.startsWith('card=')) {
      return { type: 'compressed', value: decodeURIComponent(hash.slice(5)) };
    }
    const hashParams = new URLSearchParams(hash);
    if (hashParams.get('id')) return { type: 'firestore', value: hashParams.get('id') };
    if (hashParams.get('c')) return { type: 'compressed', value: hashParams.get('c') };
    if (hashParams.get('card')) return { type: 'compressed', value: hashParams.get('card') };
    // Direct raw hash if present
    if (hash.length > 20 && !hash.includes('&') && !hash.includes('=')) {
      return { type: 'compressed', value: decodeURIComponent(hash) };
    }
  }

  // 2. Fallback to URL search (?c=... or ?card=...)
  try {
    if (searchParams.get('c')) {
      return { type: 'compressed', value: searchParams.get('c') };
    }
    if (searchParams.get('card')) {
      return { type: 'compressed', value: searchParams.get('card') };
    }
  } catch (e) {
    /* ignore search param error */
  }

  return { type: null, value: null };
}

export function normalizeCardData(decoded) {
  if (!decoded) return {};
  return {
    recipientName: decoded.recipientName ?? decoded.n ?? 'Tên người nhận',
    wishMessage:
      decoded.wishMessage ??
      decoded.m ??
      'Chúc bạn một ngày sinh nhật thật ấm áp, bình an và ngập tràn những niềm vui giản dị nhất.',
    wishStyle: decoded.wishStyle ?? decoded.s ?? 'emotional',
    template: decoded.template ?? decoded.t ?? 'botanical',
    paletteId: decoded.paletteId ?? decoded.p ?? 'alabaster',
    fontFamily: decoded.fontFamily ?? decoded.f ?? 'charm',
    polaroidCaption: decoded.polaroidCaption ?? decoded.c ?? 'Kỷ niệm khó quên ✨',
    candleCount: decoded.candleCount ?? decoded.k ?? 5,
    uploadedImage: decoded.uploadedImage ?? decoded.i ?? DEFAULT_SAMPLE_PHOTO,
    photoKey: decoded.photoKey,
    age: decoded.age ?? decoded.a ?? '--',
  };
}

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
    // Check URL for shared card state (hash or search)
    const sharedData = getSharedCardParam();
    if (sharedData.type === 'compressed' && sharedData.value) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData.value);
        if (decompressed) {
          const decoded = JSON.parse(decompressed);
          const normalized = normalizeCardData(decoded);
          let photo = normalized.uploadedImage;

          // Check localStorage for the original full HD photo (same browser / device)
          if (decoded.photoKey) {
            const localHdPhoto = window.localStorage.getItem(decoded.photoKey);
            if (localHdPhoto) {
              photo = localHdPhoto;
            }
          } else {
            const localLegacyPhoto = window.localStorage.getItem('birthday_shared_photo');
            if (localLegacyPhoto && (!photo || photo === DEFAULT_SAMPLE_PHOTO)) {
              photo = localLegacyPhoto;
            }
          }

          return {
            ...DEFAULT_STATE,
            ...normalized,
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

  const isViewMode = Boolean(getSharedCardParam().type);

  // Asynchronously load card if shared via Firestore short id (?id=...)
  useEffect(() => {
    const shared = getSharedCardParam();
    if (shared.type === 'firestore' && shared.value) {
      getCardFromFirestore(shared.value).then((remoteData) => {
        if (remoteData) {
          const normalized = normalizeCardData(remoteData);
          setCardState((prev) => ({
            ...prev,
            ...normalized,
            envelopeOpen: false,
            candlesBlown: false,
          }));
        }
      });
    }
  }, []);

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

    // Cache the original full HD photo in localStorage for same-browser instant HD render
    if (cardState.uploadedImage) {
      try {
        window.localStorage.setItem('birthday_shared_photo', cardState.uploadedImage);
        window.localStorage.setItem(photoKey, cardState.uploadedImage);
      } catch (e) {
        /* ignore localStorage quota if any */
      }
    }

    // 2. If it is a base64 image, upload to cloud to keep URL ultra-short & photo crystal clear!
    if (photoForUrl && photoForUrl.startsWith('data:image/')) {
      // Try Firebase if user configured it
      if (isFirebaseConfigured()) {
        try {
          const fireUrl = await uploadImageToFirebase(photoForUrl);
          if (fireUrl) photoForUrl = fireUrl;
        } catch (e) {
          console.warn('Firebase upload fallback:', e);
        }
      }

      // If still base64, automatically upload to free permanent cloud host
      if (photoForUrl.startsWith('data:image/')) {
        try {
          const cloudUrl = await uploadToFreeCloud(photoForUrl);
          if (cloudUrl) {
            photoForUrl = cloudUrl;
            updateField('uploadedImage', cloudUrl);
          }
        } catch (e) {
          console.warn('Free cloud upload error:', e);
        }
      }

      // If both fail, fallback to sharp thumbnail (360px, 0.72)
      if (photoForUrl.startsWith('data:image/')) {
        try {
          const micro = await createMicroThumbnail(photoForUrl, 360, 0.72);
          if (micro) photoForUrl = micro;
        } catch (err) {
          console.warn('Micro thumbnail generation error:', err);
        }
      }
    }

    // 3. If Firebase is configured, save directly to Firestore for an ultra-short branded ID link!
    if (isFirebaseConfigured()) {
      try {
        const cardId = await saveCardToFirestore({
          recipientName: cardState.recipientName,
          wishMessage: cardState.wishMessage,
          template: cardState.template,
          paletteId: cardState.paletteId,
          fontFamily: cardState.fontFamily,
          polaroidCaption: cardState.polaroidCaption,
          candleCount: cardState.candleCount,
          uploadedImage: photoForUrl,
          age: cardState.age,
        });
        if (cardId) {
          return `${window.location.origin}${window.location.pathname}?id=${cardId}`;
        }
      } catch (firestoreErr) {
        console.warn('Firestore save fallback to self-contained URL:', firestoreErr);
      }
    }

    // 4. Compact self-contained data payload (minified keys)
    const compactData = {
      n: cardState.recipientName,
      m: cardState.wishMessage,
      t: cardState.template,
      p: cardState.paletteId,
      f: cardState.fontFamily,
      c: cardState.polaroidCaption,
      k: cardState.candleCount,
      i: photoForUrl,
      photoKey: photoKey,
      a: cardState.age,
    };

    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(compactData));
    const fullUrl = `${window.location.origin}${window.location.pathname}#c=${compressed}`;

    // 5. Shorten URL with is.gd for an ultra-short 19-character short link!
    const shortUrl = await shortenUrl(fullUrl);
    return shortUrl || fullUrl;
  }, [cardState, updateField]);

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
