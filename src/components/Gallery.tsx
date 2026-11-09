import { ChangeEvent, FormEvent, useState } from 'react';
import { Check, Eye, Plus, Trash2, Upload, X } from 'lucide-react';
import { useStore } from '../store';
import { CATEGORIES, TEMPLATES } from '../templates';
import { defaultAppearance } from '../defaults';
import { look } from '../theme';
import { Cat, Template } from '../types';
import Dashboard from './Dashboard';
import TemplateBackground from './TemplateBackground';
import { deleteBackgroundAsset, saveBackgroundAsset } from '../backgrounds';
function Thumb({ tpl }: { tpl: Template }) {
  const L = look(tpl, defaultAppearance());
  const card = { background: 'var(--card)', borderRadius: Math.min(tpl.radius, 10), border: '1px solid var(--line)', backdropFilter: `blur(${tpl.cardBlur / 3}px)` };
  return (
    <div className="relative h-full w-full overflow-hidden" style={L.style} aria-hidden>
      <TemplateBackground templateId={tpl.id} bgMode="template" background={L.bg} className="absolute inset-0 z-0" />
      <div className="relative z-10">
        <div className="flex justify-center gap-1.5 pt-3 text-[8px]">{['Home', 'Dev', 'Work', 'Daily'].map((n, i) => <span key={n} className={`px-1.5 py-0.5 ${tpl.nav === 'pill' ? 'rounded-full' : ''}`} style={{ background: i === 0 && tpl.nav === 'pill' ? 'var(--accent)' : undefined, color: i === 0 && tpl.nav === 'pill' ? '#fff' : undefined, borderBottom: i === 0 && tpl.nav === 'underline' ? '1.5px solid var(--accent)' : undefined, opacity: i && tpl.nav === 'plain' ? 0.5 : 1 }}>{n}</span>)}</div>
        <div className={`mt-3 flex flex-col gap-2 px-6 ${tpl.layout === 'split' ? '' : 'items-center'}`}>
        <div className={`font-light leading-none ${tpl.layout === 'classic' ? 'text-lg' : 'text-3xl'}`}>10:24</div>
        <div className={`h-5 w-3/4 ${tpl.search === 'pill' ? 'rounded-full' : 'rounded-md'}`} style={{ ...card, background: 'var(--card)' }} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 px-5">{[0, 1, 2, 3].map(i => tpl.shortcuts === 'tiles' ? <div key={i} className="mx-auto h-6 w-6 rounded-full bg-white/90 shadow-sm" /> : <div key={i} className="h-10" style={card} />)}</div>
      </div>
    </div>
  );
}
export default function Gallery({ embedded, onClose, onApplied }: { embedded?: boolean; onClose?: () => void; onApplied?: () => void }) {
  const { data, patch } = useStore();
  const [cat, setCat] = useState<string>('All');
  const [prev, setPrev] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Cat>('Classic');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const list = [...TEMPLATES, ...data.customTemplates].filter(t => cat === 'All' || t.category === cat);
  const apply = (id: string) => {
    patch({ templateId: id, appearance: { ...data.appearance, bgMode: 'template' } });
    setPrev(null);
    onApplied?.();
  };
  const deleteTemplate = async (template: Template) => {
    if (!confirm(`Delete "${template.name}"? This will remove the template and its uploaded background.`)) return;
    try {
      await deleteBackgroundAsset(template.id);
      patch({
        customTemplates: data.customTemplates.filter(item => item.id !== template.id),
        ...(data.templateId === template.id ? { templateId: 'classic-chrome' } : {}),
      });
      if (prev === template.id) setPrev(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'The template could not be deleted.');
    }
  };
  const createTemplate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Choose a supported image or video file.');
      return;
    }

    setSaving(true);
    try {
      const id = `user-template-${crypto.randomUUID()}`;
      await saveBackgroundAsset(id, file);
      const base = TEMPLATES.find(t => t.category === category) ?? TEMPLATES[0];
      const customTemplate: Template = {
        ...base,
        id,
        name: name.trim(),
        category,
        description: `Your custom ${file.type.startsWith('video/') ? 'video' : 'image'} template.`,
        customMedia: file.type.startsWith('video/') ? 'video' : 'image',
      };
      patch({ customTemplates: [...data.customTemplates, customTemplate] });
      setCat(category);
      setName('');
      setFile(null);
      setCreating(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'The custom template could not be saved.');
    }
    setSaving(false);
  };
  const body = (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><h2 className="text-2xl font-semibold tracking-tight">Choose a template</h2><p className="muted mt-1 text-sm">Templates change the look only. Your shortcuts, notes and tasks always stay.</p></div>
        <button className="btn flex shrink-0 items-center gap-2" onClick={() => setCreating(true)}><Plus size={14} />Create template</button>
        {onClose && <button className="btn flex items-center gap-1.5" onClick={onClose}><X size={14} />Close</button>}
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">{['All', ...CATEGORIES].map(c => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm transition ${cat === c ? 'bg-[var(--accent)] text-white' : 'bg-[var(--hover)] hover:bg-[var(--line)]'}`}>{c}</button>)}</div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(t => { const on = data.templateId === t.id; return (
          <article key={t.id} className="group overflow-hidden rounded-2xl border bg-[var(--solid)] transition duration-200 hover:-translate-y-1 hover:shadow-2xl" style={{ borderColor: on ? 'var(--accent)' : 'var(--line)', boxShadow: on ? '0 0 0 1px var(--accent)' : undefined }}>
            <div className="relative aspect-[16/10]"><Thumb tpl={t} />
              {on && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-white"><Check size={12} />Active</span>}
              <button onClick={() => setPrev(t.id)} className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100 focus-visible:opacity-100" aria-label={`Preview ${t.name}`}><span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black"><Eye size={15} />Preview</span></button></div>
            <div className="p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">{t.name}</h3><span className="muted rounded-full bg-[var(--hover)] px-2.5 py-0.5 text-xs">{t.category}</span></div>
              <p className="muted mt-1 text-sm">{t.description}</p>
              <div className="mt-4 flex gap-2"><button className="btn flex-1" onClick={() => setPrev(t.id)}>Preview</button><button className="btn-primary flex-1" disabled={on && !onApplied} onClick={() => apply(t.id)}>{on ? (onApplied ? 'Continue' : 'Applied') : 'Apply Template'}</button>{data.customTemplates.some(item => item.id === t.id) && <button className="btn flex items-center justify-center !text-red-500" aria-label={`Delete ${t.name}`} title="Delete template" onClick={() => void deleteTemplate(t)}><Trash2 size={15} /></button>}</div></div>
          </article>); })}
      </div>
    </div>
  );
  return (
    <>
      {embedded ? body : <div className="fixed inset-0 z-40 overflow-auto bg-[var(--solid)] text-[var(--fg)] animate-fade">{body}</div>}
      {prev && <div className="fixed inset-0 z-[70] animate-fade"><Dashboard templateId={prev} preview onExitPreview={() => setPrev(null)} onApply={() => apply(prev)} /></div>}
      {creating && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setCreating(false); }}>
        <form className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--solid)] p-6 text-[var(--fg)] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="create-template-title" onSubmit={e => void createTemplate(e)}>
          <div className="flex items-center justify-between"><h3 id="create-template-title" className="text-lg font-semibold">Create your template</h3><button type="button" className="btn p-2" aria-label="Close" onClick={() => setCreating(false)}><X size={14} /></button></div>
          <label className="block space-y-1.5 text-sm"><span>Template name</span><input className="input" required maxLength={40} value={name} onChange={e => setName(e.target.value)} placeholder="My wallpaper" /></label>
          <label className="block space-y-1.5 text-sm"><span>Template type</span><select className="input" value={category} onChange={e => setCategory(e.target.value as Cat)}>{CATEGORIES.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--line)] p-3 text-sm hover:bg-[var(--hover)]"><Upload size={16} />{file ? file.name : 'Choose an image or video'}<input className="hidden" type="file" accept="image/*,video/*" required onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)} /></label>
          <p className="muted text-xs">This adds a reusable template to the gallery. It won’t change your current template until you apply it.</p>
          <div className="flex justify-end gap-2"><button type="button" className="btn" onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="btn-primary" disabled={!file || !name.trim() || saving}>{saving ? 'Saving…' : 'Add template'}</button></div>
        </form>
      </div>}
    </>
  );
}
