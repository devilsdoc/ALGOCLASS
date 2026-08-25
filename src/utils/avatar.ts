/**
 * Generates an SVG Data URI default avatar with the user's initials.
 * Fully offline, instant rendering, and responsive with high-contrast typography.
 */
export const getDefaultAvatar = (name: string): string => {
  const cleanName = (name || 'User').trim();
  const initials = cleanName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  // Deterministic background hue based on string characters for distinct pleasant colors
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    { start: '#4f46e5', end: '#7c3aed' }, // Indigo -> Violet
    { start: '#0284c7', end: '#2563eb' }, // Sky -> Blue
    { start: '#059669', end: '#0d9488' }, // Emerald -> Teal
    { start: '#d97706', end: '#ea580c' }, // Amber -> Orange
    { start: '#db2777', end: '#9333ea' }, // Pink -> Purple
    { start: '#475569', end: '#1e293b' }  // Slate -> Dark Slate
  ];
  const palette = palettes[Math.abs(hash) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.start}" />
      <stop offset="100%" stop-color="${palette.end}" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="36" fill="url(#userGrad)" />
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" letter-spacing="1">${initials}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
