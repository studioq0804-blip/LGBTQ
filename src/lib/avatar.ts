// Utility to generate deterministic DiceBear avatar URLs based on a seed (e.g., userId)
// Docs: https://www.dicebear.com/styles/

export const AVATAR_STYLES = [
  'adventurer-neutral',
  'avataaars',
  'micah',
  'identicon',
  'thumbs'
] as const;

export type AvatarStyle = typeof AVATAR_STYLES[number];

export function getAvatarUrl(seed: string, size: number = 256, style: AvatarStyle = 'adventurer-neutral'): string {
  const safeSeed = encodeURIComponent(seed || 'anonymous');
  const safeStyle = AVATAR_STYLES.includes(style) ? style : 'adventurer-neutral';
  return `https://api.dicebear.com/7.x/${safeStyle}/svg?seed=${safeSeed}&size=${size}`;
}

// プリセットアバター（男性/女性/バイセクシャル）
export type AvatarPreset = 'male' | 'female' | 'bisexual';

// 共通のバストシルエット（胸像）を描くヘルパー
function bustSilhouette(fill: string, stroke: string, extraDefs = '', bodyExtra = ''): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256" role="img" aria-label="avatar preset">` +
  `${extraDefs}` +
  `<rect x="4" y="4" width="92" height="92" rx="12" ry="12" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.4"/>` +
  `<g fill="${fill}" stroke="${stroke}" stroke-width="2" opacity="0.85">` +
  `<circle cx="50" cy="34" r="16"/>` +
  `<path d="M20 84c4-14 16-22 30-22s26 8 30 22z"${bodyExtra}/>` +
  `</g>` +
  `</svg>`;
}

export function getPresetAvatarDataUrl(preset: AvatarPreset, size: number = 256): string {
  let svg = '';
  if (preset === 'male') {
    svg = bustSilhouette('#1f5b73', '#0f3544');
  } else if (preset === 'female') {
    // 少し柔らかいピンクトーン
    svg = bustSilhouette('#f8a6c2', '#d86a95');
  } else {
    // バイセクシャル旗のグラデーション
    const defs = `\n<defs>\n  <linearGradient id="biGrad" x1="0" y1="0" x2="0" y2="1">\n    <stop offset="0%" stop-color="#D60270"/>\n    <stop offset="50%" stop-color="#9B4F96"/>\n    <stop offset="100%" stop-color="#0038A8"/>\n  </linearGradient>\n</defs>\n`;
    svg = bustSilhouette('url(#biGrad)', '#5a3b66', defs);
  }

  // サイズを置換
  svg = svg.replace('width="256"', `width="${size}"`).replace('height="256"', `height="${size}"`);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `data:image/svg+xml;utf8,${encoded}`;
}

// デフォルトの「人型シルエット（濃いブルー）」SVGをData URLで返す
export function getSilhouetteDataUrl(size: number = 256, fillColor: string = '#1F5B73', strokeColor: string = '#0F3544'): string {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="${size}" height="${size}" role="img" aria-label="avatar silhouette">` +
  `<title>Avatar</title>` +
  `<g fill="${fillColor}" stroke="${strokeColor}" stroke-width="2">` +
  `<circle cx="50" cy="30" r="25"/>` +
  `<polygon points="50,60 20,120 80,120"/>` +
  `</g>` +
  `</svg>`;
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `data:image/svg+xml;utf8,${encoded}`;
}
