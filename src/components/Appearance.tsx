import { ChangeEvent, ReactNode } from 'react';
import { RotateCcw, Upload } from 'lucide-react';
import { useStore } from '../store';
import { GRADIENTS, defaultAppearance } from '../defaults';
import { getTemplate } from '../templates';
import { Appearance, FontKey, WidgetKey } from '../types';
import { Row, Seg, Slider, Toggle } from './ui';
import { resizeBackgroundImage, saveBackgroundVideo } from '../backgrounds';
const ACCENTS = ['#1a73e8', '#8b7cff', '#ff6b4a', '#22d3ee', '#22c55e', '#f43f5e', '#f59e0b'];
const resize = (file: File): Promise<string> => new Promise((res, rej) => {
  const fr = new FileReader(); fr.onerror = () => rej(new Error('read')); fr.onload = () => {
    const img = new Image(); img.onerror = () => rej(new Error('img')); img.onload = () => {
      const k = Math.min(1, 2200 / img.width); const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.85));
    }; img.src = fr.result as string;
  }; fr.readAsDataURL(file);
});
const Group = ({ title, children }: { title: string; children: ReactNode }) => <div className="border-b border-[var(--line)] pb-3 last:border-0"><h4 className="muted mb-1 mt-3 text-xs font-medium">{title}</h4>{children}</div>;
export function AppearancePanel({ withWidgets }: { withWidgets?: boolean }) {
  const { data, patch } = useStore(); const a = data.appearance; const tpl = getTemplate(data.templateId, data.customTemplates);
  const set = (p: Partial<Appearance>) => patch({ appearance: { ...a, ...p } });
  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { set({ bgMode: 'image', bgImage: await resizeBackgroundImage(f) }); }
    catch (error) { alert(error instanceof Error ? error.message : 'That image could not be loaded.'); }
    e.target.value = '';
  };
  const uploadVideo = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { await saveBackgroundVideo(f); set({ bgMode: 'video' }); }
    catch (error) { alert(error instanceof Error ? error.message : 'That video could not be saved.'); }
    e.target.value = '';
  };
  return (
    <div>
      <Group title="Theme"><Row label="Mode"><Seg value={a.theme} onChange={v => set({ theme: v })} options={[{ v: 'template', l: 'Template' }, { v: 'light', l: 'Light' }, { v: 'dark', l: 'Dark' }]} /></Row>
        <Row label="Accent color"><div className="flex items-center gap-1.5">{ACCENTS.map(c => <button key={c} aria-label={c} onClick={() => set({ accent: c })} className="h-5 w-5 rounded-full ring-offset-2 ring-offset-[var(--solid)]" style={{ background: c, boxShadow: a.accent === c ? `0 0 0 2px var(--solid),0 0 0 4px ${c}` : undefined }} />)}<input type="color" aria-label="Custom accent" value={a.accent ?? tpl.accent} onChange={e => set({ accent: e.target.value })} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" /></div></Row></Group>
      <Group title="Background">
        <Row label="Type"><Seg value={a.bgMode} onChange={v => set({ bgMode: v })} options={[{ v: 'template', l: 'Wallpaper' }, { v: 'color', l: 'Color' }, { v: 'gradient', l: 'Gradient' }, { v: 'image', l: 'Image' }, { v: 'video', l: 'Video' }]} /></Row>
        {a.bgMode === 'color' && <Row label="Color"><input type="color" value={a.bgColor} onChange={e => set({ bgColor: e.target.value })} className="h-8 w-14 cursor-pointer rounded border-0 bg-transparent" /></Row>}
        {a.bgMode === 'gradient' && <div className="grid grid-cols-6 gap-2 py-2">{GRADIENTS.map(g => <button key={g} aria-label="Gradient" onClick={() => set({ bgGradient: g })} className="h-10 rounded-lg" style={{ background: g, outline: a.bgGradient === g ? '2px solid var(--accent)' : undefined, outlineOffset: 2 }} />)}</div>}
        {a.bgMode === 'image' && <label className="btn flex w-full cursor-pointer items-center justify-center gap-2 py-2"><Upload size={14} />{a.bgImage ? 'Replace image' : 'Upload an image'}<input type="file" accept="image/*" className="hidden" onChange={e => void upload(e)} /></label>}
        {a.bgMode === 'video' && <label className="btn flex w-full cursor-pointer items-center justify-center gap-2 py-2"><Upload size={14} />Replace video<input type="file" accept="video/*" className="hidden" onChange={e => void uploadVideo(e)} /></label>}
        <Row label="Blur"><Slider value={a.blur} min={0} max={20} onChange={blur => set({ blur })} /></Row>
        <Row label="Brightness"><Slider value={a.brightness} min={40} max={130} onChange={brightness => set({ brightness })} /></Row></Group>
      <Group title="Widgets">
        <Row label="Transparency"><Slider value={a.opacity ?? Math.round(tpl.opacity * 100)} min={0} max={100} onChange={opacity => set({ opacity })} /></Row>
        <Row label="Corner radius"><Slider value={a.radius ?? tpl.radius} min={0} max={32} onChange={radius => set({ radius })} /></Row>
        <Row label="Shadow"><Seg value={a.shadow} onChange={shadow => set({ shadow })} options={[{ v: 0, l: 'None' }, { v: 1, l: 'S' }, { v: 2, l: 'M' }, { v: 3, l: 'L' }]} /></Row>
        <Row label="Shortcut columns"><Seg value={a.columns ?? tpl.columns} onChange={columns => set({ columns })} options={[2, 3, 4, 5].map(n => ({ v: n, l: String(n) }))} /></Row></Group>
      <Group title="Type"><Row label="Font"><select className="input !w-32" value={a.font ?? tpl.font} onChange={e => set({ font: e.target.value as FontKey })}><option value="sans">Sans</option><option value="serif">Serif</option><option value="mono">Mono</option><option value="rounded">Rounded</option></select></Row>
        <Row label="Size"><Slider value={a.fontSize} min={12} max={20} onChange={fontSize => set({ fontSize })} /></Row></Group>
      <Group title="Layout"><Row label="Search position"><Seg value={a.searchPos} onChange={searchPos => set({ searchPos })} options={[{ v: 'top', l: 'Top' }, { v: 'center', l: 'Center' }]} /></Row>
        <Row label="Clock position"><Seg value={a.clockPos} onChange={clockPos => set({ clockPos })} options={[{ v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'right', l: 'Right' }]} /></Row></Group>
      {withWidgets && <WidgetToggles />}
      <button className="btn mt-3 flex items-center gap-2" onClick={() => patch({ appearance: defaultAppearance() })}><RotateCcw size={14} />Reset appearance</button>
    </div>
  );
}
export function WidgetToggles() {
  const { data, patch } = useStore();
  const labels: Record<WidgetKey, string> = { clock: 'Clock and date', weather: 'Weather', search: 'Search bar', shortcuts: 'Shortcut panels' };
  return <div className="pt-1">{(Object.keys(labels) as WidgetKey[]).map(k => <Row key={k} label={labels[k]}><Toggle label={labels[k]} on={data.widgets[k]} onChange={b => patch({ widgets: { ...data.widgets, [k]: b } })} /></Row>)}</div>;
}
