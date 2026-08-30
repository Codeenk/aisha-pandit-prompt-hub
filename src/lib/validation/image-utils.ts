import { ImageReference } from '@/types/prompt';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB input limit

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported format (${file.type || 'unknown'}). Please upload JPG, PNG, or WEBP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is 20MB.`,
    };
  }

  return { valid: true };
}

/**
 * Optimizes an image using client-side canvas:
 * - Scales down if dimension exceeds maxDimension (e.g. 1600px)
 * - Encodes as compressed JPEG/WEBP base64 data URL
 */
export async function processAndOptimizeImage(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<ImageReference> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to read image file.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio downscale
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
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context is not available
          resolve({
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            name: file.name,
            dataUrl,
            mimeType: file.type || 'image/jpeg',
            size: file.size,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const optimizedDataUrl = canvas.toDataURL(mime, quality);

        resolve({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          name: file.name,
          dataUrl: optimizedDataUrl,
          mimeType: mime,
          size: Math.round((optimizedDataUrl.length * 3) / 4),
        });
      };

      img.onerror = () => {
        reject(new Error('Could not load image into canvas for processing.'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('File reading failed.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Creates high-quality procedural sample images for 1-click testing
 */
export function createSampleImage(
  type: 'model' | 'fashion' | 'location' | 'video-source' | 'pose'
): ImageReference {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d')!;

  if (type === 'model') {
    // Elegant Model Reference Placeholder
    const grad = ctx.createLinearGradient(0, 0, 0, 750);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 750);

    // Warm portrait glow
    const radial = ctx.createRadialGradient(300, 320, 30, 300, 320, 260);
    radial.addColorStop(0, '#fcd34d33');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 600, 750);

    // Stylized silhouette portrait
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(300, 260, 95, 0, Math.PI * 2); // Head
    ctx.fill();

    // Hair
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(300, 220, 110, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();

    // Shoulders
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(300, 480, 170, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MODEL REFERENCE: AISHA', 300, 640);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Identity Anchor (Facial Features & Skin Tone)', 300, 675);

    return {
      id: 'sample-model',
      name: 'aisha-model-reference.jpg',
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      mimeType: 'image/jpeg',
      size: 45000,
    };
  }

  if (type === 'fashion') {
    // Fashion Reference Placeholder
    const grad = ctx.createLinearGradient(0, 0, 600, 750);
    grad.addColorStop(0, '#042f2e');
    grad.addColorStop(1, '#022c22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 750);

    // Emerald silk dress illustration
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(250, 160);
    ctx.lineTo(350, 160);
    ctx.lineTo(410, 360);
    ctx.lineTo(470, 580);
    ctx.lineTo(130, 580);
    ctx.lineTo(190, 360);
    ctx.closePath();
    ctx.fill();

    // Gold sash detail
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(210, 320);
    ctx.lineTo(390, 320);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FASHION: EMERALD SILK GOWN', 300, 640);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('Clothing Source (Silhouette & Fabric Blueprint)', 300, 675);

    return {
      id: 'sample-fashion',
      name: 'emerald-silk-gown.jpg',
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      mimeType: 'image/jpeg',
      size: 42000,
    };
  }

  if (type === 'location') {
    // Location Reference Placeholder
    const grad = ctx.createLinearGradient(0, 0, 0, 750);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#b45309');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 750);

    // Sun
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(430, 200, 70, 0, Math.PI * 2);
    ctx.fill();

    // Archway
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(300, 460, 160, Math.PI, 0);
    ctx.lineTo(460, 620);
    ctx.lineTo(140, 620);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOCATION: MEDITERRANEAN VILLA', 300, 640);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#fde68a';
    ctx.fillText('Environment Reference (Golden Hour Terrace)', 300, 675);

    return {
      id: 'sample-location',
      name: 'mediterranean-villa.jpg',
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      mimeType: 'image/jpeg',
      size: 46000,
    };
  }

  if (type === 'pose') {
    const grad = ctx.createLinearGradient(0, 0, 600, 750);
    grad.addColorStop(0, '#0f0f12');
    grad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 750);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    // Head
    ctx.beginPath();
    ctx.arc(300, 140, 42, 0, Math.PI * 2);
    ctx.stroke();
    // Spine
    ctx.beginPath();
    ctx.moveTo(300, 182);
    ctx.lineTo(300, 380);
    ctx.stroke();
    // Arms — elegant editorial pose
    ctx.beginPath();
    ctx.moveTo(300, 220);
    ctx.lineTo(200, 300);
    ctx.lineTo(170, 380);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(300, 220);
    ctx.lineTo(400, 260);
    ctx.lineTo(430, 180);
    ctx.stroke();
    // Legs — contrapposto
    ctx.beginPath();
    ctx.moveTo(300, 380);
    ctx.lineTo(250, 520);
    ctx.lineTo(240, 640);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(300, 380);
    ctx.lineTo(350, 515);
    ctx.lineTo(360, 640);
    ctx.stroke();
    // Joints
    ctx.fillStyle = '#a5b4fc';
    [[300,140],[300,220],[200,300],[170,380],[400,260],[430,180],[300,380],[250,520],[240,640],[350,515],[360,640]].forEach(([x,y])=>{
      ctx.beginPath();
      ctx.arc(x,y,7,0,Math.PI*2);
      ctx.fill();
    });
    // Ground line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 640);
    ctx.lineTo(460, 640);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POSE: EDITORIAL STANCE', 300, 680);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Skeletal Blueprint (Angles & Weight Distribution)', 300, 705);

    return {
      id: 'sample-pose',
      name: 'editorial-pose-reference.jpg',
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      mimeType: 'image/jpeg',
      size: 44000,
    };
  }

  // Video Source Image
  const grad = ctx.createLinearGradient(0, 0, 600, 750);
  grad.addColorStop(0, '#311042');
  grad.addColorStop(1, '#090514');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 750);

  // Phone Mirror Selfie Motif
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(300, 240, 85, 0, Math.PI * 2);
  ctx.fill();

  // Smartphone rectangle
  ctx.fillStyle = '#1e293b';
  ctx.roundRect(330, 290, 80, 140, 12);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SOURCE FRAME: AISHA MIRROR', 300, 640);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#c084fc';
  ctx.fillText('Image-to-Video Visual Anchor', 300, 675);

  return {
    id: 'sample-video-source',
    name: 'aisha-mirror-source.jpg',
    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
    mimeType: 'image/jpeg',
    size: 48000,
  };
}

/**
 * Creates an ultra-compact micro thumbnail (< 4KB) for history preview
 */
export async function createMicroThumbnail(
  dataUrl: string,
  maxSize = 64
): Promise<string | undefined> {
  if (typeof window === 'undefined') return undefined;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const aspect = img.width / img.height;
        let w = maxSize;
        let h = maxSize;
        if (aspect > 1) {
          h = Math.round(maxSize / aspect);
        } else {
          w = Math.round(maxSize * aspect);
        }
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Low quality webp/jpeg to keep size under 2KB
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve(undefined);
      img.src = dataUrl;
    } catch {
      resolve(undefined);
    }
  });
}

