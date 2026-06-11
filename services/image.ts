// Convert an uploaded File into a persistable base64 data URL.
//
// Why not URL.createObjectURL? That returns a `blob:` URL that is only valid for
// the current page session — once you refresh (or store it in the DB and reload),
// the blob is gone and the image breaks. A data URL embeds the actual bytes, so it
// survives refresh and round-trips through the backend.
//
// We also downscale + JPEG-compress so the payload stays well under the API's body
// size limit (a raw phone photo can be several MB; this keeps it to a few hundred KB).
export const fileToDataUrl = (file: File, maxDim = 1024, quality = 0.82): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; } // fall back to the raw data URL
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
