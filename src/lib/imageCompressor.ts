/**
 * Compresses an image file client-side using HTML5 Canvas
 * Resizes max dimensions to 900px and exports as 72% quality JPEG.
 * Produces lightweight ~60KB - 120KB Data URLs safely within Firestore's 1MB document limit.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG Data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log(`Image compressed: original size ~${Math.round(file.size / 1024)}KB -> compressed ~${Math.round(compressedDataUrl.length / 1024)}KB`);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
