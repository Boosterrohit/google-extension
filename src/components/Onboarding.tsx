import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { ENGINES, PRESETS, defaultPanels, uid } from '../defaults';
import { getTemplate } from '../templates';
import { look } from '../theme';
import { Panel } from '../types';
import Gallery from './Gallery';
import TemplateBackground from './TemplateBackground';
export default function Onboarding() {
  const { data, patch, flush } = useStore(); const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>(Object.keys(PRESETS)); const [sites, setSites] = useState<{ title: string; url: string }[]>([]); const [t, setT] = useState(''); const [u, setU] = useState('');
  const L = look(getTemplate(step === 0 ? 'anime-sunset' : 'elegant-dark'), data.appearance);
  const finish = async () => {
    const home: Panel[] = picked.map(k => PRESETS[k]());
    if (sites.length) home.unshift({ id: uid(), title: 'Favorites', items: sites.map(s => ({ id: uid(), ...s })) });
    patch({ panels: { ...defaultPanels(), home }, onboarded: true }); await flush();
  };
  const addSite = () => { if (!u.trim()) return; const url = /^https?:/.test(u) ? u.trim() : `https://${u.trim()}`; setSites([...sites, { title: t.trim() || url.replace(/^https?:\/\/(www\.)?/, ''), url }]); setT(''); setU(''); };
  const dots = <div className="flex justify-center gap-2 py-4">{[0, 1, 2, 3].map(i => <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === step ? 24 : 6, background: i === step ? 'var(--accent)' : 'var(--line)' }} />)}</div>;
  if (step === 0) return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6" style={L.style}>
      <TemplateBackground templateId="anime-sunset" bgMode={data.appearance.bgMode} background={L.bg} className="absolute inset-0 z-0" />
      <div className="relative z-10 max-w-xl text-center"><Sparkles className="mx-auto mb-5" size={28} /><h1 className="text-5xl font-semibold tracking-tight">Make every new tab yours</h1><p className="mx-auto mt-4 max-w-md text-lg" style={{ color: 'var(--tmuted)' }}>Pick a look, choose a search engine, and set up your shortcuts. It takes about a minute.</p>
        <button className="btn-primary mt-8 !rounded-full !px-8 !py-3 !text-base" onClick={() => setStep(1)}>Get started</button></div>
    </div>);
  return (
    <div className="min-h-screen bg-[var(--solid)] text-[var(--fg)]" style={L.style}>
      {step === 1 && <><Gallery embedded onApplied={() => setStep(2)} />{dots}</>}
      {step === 2 && <div className="mx-auto max-w-xl px-6 py-16"><h2 className="text-2xl font-semibold tracking-tight">Pick your search engine</h2><p className="muted mt-1 text-sm">You can switch any time from the search bar.</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">{ENGINES.filter(e => e.id !== 'custom').map(e => <button key={e.id} onClick={() => patch({ engine: e.id })} className="flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition hover:bg-[var(--hover)]" style={{ borderColor: data.engine === e.id ? 'var(--accent)' : 'var(--line)' }}>{e.name}{data.engine === e.id && <Check size={16} className="text-[var(--accent)]" />}</button>)}</div>
        {dots}<div className="flex justify-between"><button className="btn" onClick={() => setStep(1)}>Back</button><button className="btn-primary" onClick={() => setStep(3)}>Continue</button></div></div>}
      {step === 3 && <div className="mx-auto max-w-xl px-6 py-16"><h2 className="text-2xl font-semibold tracking-tight">Set up your shortcuts</h2><p className="muted mt-1 text-sm">Choose the starter panels for your Home tab. You can edit everything later.</p>
        <div className="mt-6 flex flex-wrap gap-2">{Object.keys(PRESETS).map(k => { const on = picked.includes(k); return <button key={k} onClick={() => setPicked(on ? picked.filter(x => x !== k) : [...picked, k])} className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm" style={{ borderColor: on ? 'var(--accent)' : 'var(--line)', background: on ? 'var(--hover)' : undefined }}>{on && <Check size={13} />}{k}</button>; })}</div>
        <form className="mt-6 flex gap-2" onSubmit={e => { e.preventDefault(); addSite(); }}><input className="input" placeholder="Name" value={t} onChange={e => setT(e.target.value)} /><input className="input" placeholder="Address" value={u} onChange={e => setU(e.target.value)} /><button className="btn">Add</button></form>
        {sites.length > 0 && <p className="muted mt-3 text-xs">Favorites: {sites.map(s => s.title).join(', ')}</p>}
        {dots}<div className="flex justify-between"><button className="btn" onClick={() => setStep(2)}>Back</button><button className="btn-primary" onClick={() => void finish()}>Open my dashboard</button></div></div>}
    </div>
  );
}
