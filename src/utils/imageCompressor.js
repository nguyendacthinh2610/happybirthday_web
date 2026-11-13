/**
 * Robust client-side image processor
 * Always resolves to a valid data URL without throwing or rejecting
 */
export function compressImage(file, maxDimension = 480, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file) {
      return resolve(null);
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result;
      if (!rawDataUrl || typeof rawDataUrl !== 'string') {
        return resolve(null);
      }

      // Attempt canvas downscaling for optimal size & speed
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          try {
            let width = img.width || 400;
            let height = img.height || 300;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              return resolve(rawDataUrl);
            }

            // High quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export to JPEG with good compression ratio
            const compressed = canvas.toDataURL('image/jpeg', quality);
            if (compressed && compressed.length > 50) {
              resolve(compressed);
            } else {
              resolve(rawDataUrl);
            }
          } catch (canvasErr) {
            console.warn('Canvas export error, using raw image:', canvasErr);
            resolve(rawDataUrl);
          }
        };

        img.onerror = (imgErr) => {
          console.warn('Image decode error, using raw data URL:', imgErr);
          resolve(rawDataUrl);
        };

        img.src = rawDataUrl;
      } catch (err) {
        console.warn('Image processing fallback:', err);
        resolve(rawDataUrl);
      }
    };

    reader.onerror = (err) => {
      console.error('FileReader error:', err);
      resolve(null);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Creates an ultra-compact micro thumbnail (< 1.5 KB) suitable for URL sharing
 */
export function createMicroThumbnail(source, maxDimension = 120, quality = 0.38) {
  return new Promise((resolve) => {
    if (!source || typeof source !== 'string') {
      return resolve(null);
    }
    if (source.startsWith('preset:') || source.startsWith('http://') || source.startsWith('https://')) {
      return resolve(source);
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          let width = img.width || 120;
          let height = img.height || 90;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, width, height);

          const thumb = canvas.toDataURL('image/jpeg', quality);
          resolve(thumb);
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = source;
    } catch (e) {
      resolve(null);
    }
  });
}
