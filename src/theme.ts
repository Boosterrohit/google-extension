import { CSSProperties } from 'react';
import { Appearance, FontKey, Template } from './types';
import { VIDEO_TEMPLATE_IDS } from './templates';
export const FONTS: Record<FontKey, string> = {
  sans: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  rounded: 'ui-rounded, "Nunito", "Segoe UI", system-ui, sans-serif',
};
export const SHADOWS = ['none', '0 1px 2px rgba(0,0,0,.12)', '0 6px 24px rgba(0,0,0,.18)', '0 18px 48px rgba(0,0,0,.38)'];
const lum = (h: string) => { const n = parseInt(h.replace('#', '').padEnd(6, '0').slice(0, 6), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
/** Merge a template with the user's appearance overrides into CSS variables. */
export function look(t: Template, a: Appearance) {
  const videoTemplate = a.bgMode === 'template' && (VIDEO_TEMPLATE_IDS.has(t.id) || !!t.customMedia);
  const dark = a.theme === 'template' ? (videoTemplate || t.dark) : a.theme === 'dark';
  let bg = t.bg, onLight = videoTemplate || a.bgMode === 'video' || t.onBg === 'light';
  if (a.bgMode === 'color') { bg = `linear-gradient(${a.bgColor},${a.bgColor})`; onLight = lum(a.bgColor) < 0.55; }
  else if (a.bgMode === 'gradient') { bg = a.bgGradient; onLight = true; }
  else if (a.bgMode === 'image' && a.bgImage) { bg = `url("${a.bgImage}")`; onLight = true; }
  const alpha = a.opacity === null ? t.opacity : a.opacity / 100;
  const rgb = dark ? '18,21,31' : '255,255,255';
  const style = {
    '--accent': a.accent ?? t.accent, '--radius': `${a.radius ?? t.radius}px`, '--card': `rgba(${rgb},${alpha})`,
    '--solid': dark ? '#171a24' : '#ffffff', '--fg': dark ? '#f4f5f9' : '#15171d',
    '--muted': dark ? 'rgba(244,245,249,.6)' : 'rgba(21,23,29,.56)', '--line': dark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.08)',
    '--hover': dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.05)', '--shadow': SHADOWS[a.shadow], '--cblur': `${t.cardBlur}px`,
    '--tfg': onLight ? '#ffffff' : '#15171d', '--tmuted': onLight ? 'rgba(255,255,255,.72)' : 'rgba(21,23,29,.6)',
    '--thover': onLight ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.06)',
    fontFamily: FONTS[a.font ?? t.font], fontSize: `${a.fontSize}px`, color: 'var(--tfg)',
  } as CSSProperties;
  return { style, bg, dark };
}
