import { Template } from './types';
const scene = (sky: string[], layers: [string, string][], extra = '') => {
  const stops = sky.map((c, i) => `<stop offset='${i / (sky.length - 1)}' stop-color='${c}'/>`).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMid slice'><defs><linearGradient id='g' x2='0' y2='1'>${stops}</linearGradient><radialGradient id='s'><stop offset='0' stop-color='#fff' stop-opacity='.55'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></radialGradient></defs><rect width='1600' height='900' fill='url(#g)'/>${extra}${layers.map(([c, d]) => `<path fill='${c}' d='${d}'/>`).join('')}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};
const stars = Array.from({ length: 60 }, (_, i) => `<circle cx='${(i * 263) % 1600}' cy='${(i * 127) % 520}' r='${1 + (i % 3) * 0.6}' fill='#fff' opacity='${0.4 + (i % 4) * 0.15}'/>`).join('');
const base = { onBg: 'light', font: 'sans', cardBlur: 14, layout: 'center', nav: 'pill', search: 'pill', shortcuts: 'cards', columns: 4, dark: true, radius: 18, opacity: 0.34 } as const;
export const CATEGORIES = ['Classic', 'Minimal', 'Modern', 'Nature', 'Productivity', 'Gaming', 'Anime', 'Cinematic'] as const;
export const VIDEO_TEMPLATE_IDS = new Set(['anime-sunset', 'mountain-view', 'windows-style', 'moonlight', 'ocean-sunset', 'elegant-dark', 'productivity-pro', 'gaming-zone']);
export const TEMPLATES: Template[] = [
  { ...base, id: 'anime-sunset', name: 'Anime Sunset', category: 'Anime', description: 'Red and orange dusk over a quiet city skyline.', accent: '#ff6b4a',
    bg: scene(['#1a0a2e', '#7b1e5a', '#ff5a3c', '#ffb36b'], [['#2a0f2f', 'M0 700 C300 640 500 700 800 660 C1100 620 1300 690 1600 650 V900 H0Z'], ['#150716', 'M0 770 H90 V690 H150 V740 H230 V630 H300 V720 H410 V670 H490 V750 H620 V650 H690 V730 H850 V610 H920 V720 H1050 V680 H1130 V760 H1260 V640 H1340 V730 H1450 V690 H1530 V760 H1600 V900 H0Z']], `<circle cx='800' cy='610' r='260' fill='url(#s)'/><circle cx='800' cy='610' r='130' fill='#fff1b8'/>`) },
  { ...base, id: 'mountain-view', name: 'Mountain View', category: 'Nature', description: 'Layered alpine ridges under a clear morning sky.', accent: '#4ea1ff', opacity: 0.3,
    bg: scene(['#2f5d8a', '#7fb0d6', '#cfe5f2'], [['#7d9cbd', 'M0 620 L180 480 L330 580 L560 360 L760 560 L980 420 L1200 600 L1400 470 L1600 580 V900 H0Z'], ['#42648d', 'M0 720 L240 540 L430 680 L700 500 L960 700 L1220 520 L1600 720 V900 H0Z'], ['#1f3a57', 'M0 820 L300 660 L560 790 L880 640 L1200 800 L1600 680 V900 H0Z']], `<circle cx='1220' cy='250' r='70' fill='#fff7d6' opacity='.9'/>`) },
  { ...base, id: 'windows-style', name: 'Windows Style', category: 'Modern', description: 'Bright blue bloom with frosted, light panels.', dark: false, onBg: 'dark', accent: '#0a64d8', radius: 10, opacity: 0.62, cardBlur: 22, nav: 'underline', search: 'box',
    bg: 'radial-gradient(ellipse at 20% 80%,rgba(255,255,255,.75),transparent 45%),radial-gradient(ellipse at 80% 20%,#7cc4ff,transparent 55%),linear-gradient(135deg,#c9e8ff,#5aa8f0 60%,#2e7bd6)' },
  { ...base, id: 'moonlight', name: 'Moonlight', category: 'Cinematic', description: 'A moonlit ridge line beneath a field of stars.', accent: '#9bb5ff', opacity: 0.3,
    bg: scene(['#050816', '#121a3d', '#2a3068'], [['#0e1330', 'M0 720 C250 640 450 740 700 690 C950 640 1200 740 1600 660 V900 H0Z'], ['#070a1c', 'M0 800 C300 740 600 820 900 780 C1200 740 1400 800 1600 770 V900 H0Z']], `${stars}<circle cx='1230' cy='210' r='150' fill='url(#s)'/><circle cx='1230' cy='210' r='66' fill='#f4f1de'/>`) },
  { ...base, id: 'ocean-sunset', name: 'Ocean Sunset', category: 'Nature', description: 'Calm water reflecting a low, peach-coloured sun.', accent: '#ff8f6b', opacity: 0.3,
    bg: scene(['#2b1b4d', '#c8507a', '#ffb86b'], [['#1d3b6b', 'M0 590 H1600 V900 H0Z'], ['#183159', 'M0 660 Q200 640 400 660 T800 660 T1200 660 T1600 660 V900 H0Z'], ['#112548', 'M0 740 Q200 720 400 740 T800 740 T1200 740 T1600 740 V900 H0Z']], `<circle cx='800' cy='590' r='240' fill='url(#s)'/><circle cx='800' cy='590' r='110' fill='#ffe29a'/>`) },
  { ...base, id: 'elegant-dark', name: 'Elegant Dark', category: 'Modern', description: 'Deep charcoal with soft violet and teal light.', accent: '#8b7cff', opacity: 0.5, cardBlur: 18,
    bg: 'radial-gradient(ellipse at 15% 10%,rgba(139,124,255,.35),transparent 50%),radial-gradient(ellipse at 90% 85%,rgba(45,212,191,.22),transparent 50%),linear-gradient(160deg,#0b0d14,#141824)' },
  { ...base, id: 'classic-chrome', name: 'Classic Chrome', category: 'Classic', description: 'The familiar centred search and round shortcut tiles.', dark: false, onBg: 'dark', accent: '#1a73e8', opacity: 1, cardBlur: 0, layout: 'classic', nav: 'plain', shortcuts: 'tiles', radius: 14,
    bg: 'linear-gradient(#ffffff,#f6f8fb)' },
  { ...base, id: 'minimal-white', name: 'Minimal White', category: 'Minimal', description: 'Quiet white space, thin type and nothing extra.', dark: false, onBg: 'dark', accent: '#111827', opacity: 1, cardBlur: 0, font: 'serif', nav: 'plain', search: 'box', shortcuts: 'tiles', radius: 6, columns: 3,
    bg: 'linear-gradient(#fdfdfc,#fdfdfc)' },
  { ...base, id: 'productivity-pro', name: 'Productivity Pro', category: 'Productivity', description: 'Clock and search side by side, dense working panels.', accent: '#38bdf8', opacity: 0.9, cardBlur: 0, layout: 'split', nav: 'underline', search: 'box', radius: 10, columns: 4,
    bg: 'radial-gradient(ellipse at 80% 0%,rgba(56,189,248,.14),transparent 50%),linear-gradient(180deg,#0f172a,#0b1220)' },
  { ...base, id: 'gaming-zone', name: 'Gaming Zone', category: 'Gaming', description: 'Neon violet and cyan on a near-black arena.', accent: '#22d3ee', font: 'mono', radius: 6, opacity: 0.55, cardBlur: 10, nav: 'underline', search: 'box',
    bg: 'radial-gradient(ellipse at 10% 90%,rgba(168,85,247,.5),transparent 45%),radial-gradient(ellipse at 90% 10%,rgba(34,211,238,.35),transparent 45%),linear-gradient(160deg,#0a0614,#150a2b)' },
];
export const getTemplate = (id: string, customTemplates: Template[] = []) =>
  customTemplates.find(t => t.id === id) ?? TEMPLATES.find(t => t.id === id) ?? TEMPLATES[6];
