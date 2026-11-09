import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4 animate-fade" onMouseDown={onClose}>
      <div role="dialog" aria-label={title} className={`card-solid max-h-[88vh] w-full overflow-auto p-5 ${wide ? 'max-w-4xl' : 'max-w-md'}`} onMouseDown={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-semibold">{title}</h3><button className="icon-btn" aria-label="Close" onClick={onClose}><X size={16} /></button></div>
        {children}
      </div>
    </div>
  );
}
export interface Field { key: string; label: string; value?: string; placeholder?: string }
export function PromptModal({ title, fields, onSubmit, onClose, submit = 'Save' }: { title: string; fields: Field[]; onSubmit: (v: Record<string, string>) => void; onClose: () => void; submit?: string }) {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(fields.map(f => [f.key, f.value ?? ''])));
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); onSubmit(v); }} className="space-y-3">
        {fields.map((f, i) => (
          <label key={f.key} className="muted block text-xs">{f.label}
            <input autoFocus={i === 0} className="input mt-1" value={v[f.key]} placeholder={f.placeholder} onChange={e => setV({ ...v, [f.key]: e.target.value })} />
          </label>
        ))}
        <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn-primary">{submit}</button></div>
      </form>
    </Modal>
  );
}
export function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return <div className="inline-flex rounded-lg bg-[var(--hover)] p-0.5 text-xs">{options.map(o => <button key={String(o.v)} onClick={() => onChange(o.v)} className={`rounded-md px-2.5 py-1 transition ${o.v === value ? 'bg-[var(--solid)] font-medium shadow-sm' : 'muted hover:opacity-80'}`}>{o.l}</button>)}</div>;
}
export const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (b: boolean) => void; label?: string }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'}`}>
    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
  </button>
);
export const Row = ({ label, children }: { label: string; children: ReactNode }) => <div className="flex items-center justify-between gap-3 py-2"><span className="text-sm">{label}</span>{children}</div>;
export const Slider = ({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) =>
  <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} className="w-36 accent-[var(--accent)]" />;
export const Empty = ({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) => (
  <div className="muted flex flex-col items-center gap-2 px-6 py-10 text-center"><div className="opacity-70">{icon}</div><p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{title}</p>{hint && <p className="text-xs">{hint}</p>}</div>
);
export function Favicon({ url, icon, size = 24 }: { url: string; icon?: string; size?: number }) {
  const [bad, setBad] = useState(false);
  let host = ''; try { host = new URL(url).hostname; } catch { /* invalid url */ }
  if (icon && /^https?:|^data:/.test(icon)) return <img src={icon} width={size} height={size} className="rounded-md object-cover" alt="" />;
  if (icon) return <span style={{ fontSize: size * 0.85, lineHeight: 1 }}>{icon}</span>;
  if (bad || !host) return <span className="grid place-items-center rounded-md bg-[var(--accent)] font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.5 }}>{(host || '?')[0].toUpperCase()}</span>;
  return <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`} width={size} height={size} className="rounded-md" alt="" onError={() => setBad(true)} />;
}
