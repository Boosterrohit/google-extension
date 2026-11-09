import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useStore } from '../store';
import { uid } from '../defaults';
import { Template } from '../types';
import { PromptModal } from './ui';
export function Nav({ tpl }: { tpl: Template }) {
  const { data, patch } = useStore(); const [editing, setEditing] = useState(false); const [dlg, setDlg] = useState<{ id?: string } | null>(null);
  const move = (i: number, d: number) => { const n = [...data.nav]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; patch({ nav: n }); };
  const remove = (id: string) => {
    if (data.nav.length < 2 || !confirm('Remove this category and its panels?')) return;
    const panels = { ...data.panels }; delete panels[id]; const nav = data.nav.filter(n => n.id !== id);
    patch({ nav, panels, activeNav: data.activeNav === id ? nav[0].id : data.activeNav });
  };
  const cls = (on: boolean) => tpl.nav === 'pill' ? `rounded-full px-4 py-1.5 ${on ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--thover)]'}`
    : tpl.nav === 'underline' ? `border-b-2 px-3 py-2 ${on ? 'border-[var(--accent)] font-medium' : 'border-transparent hover:bg-[var(--thover)] rounded-t-md'}` : `px-3 py-2 ${on ? 'font-semibold' : 'opacity-60 hover:opacity-100'}`;
  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-1 text-sm" aria-label="Categories">
      {data.nav.map((n, i) => (
        <span key={n.id} className="flex shrink-0 items-center">
          <button onClick={() => patch({ activeNav: n.id })} className={`whitespace-nowrap transition ${cls(n.id === data.activeNav)}`} aria-current={n.id === data.activeNav}>{n.name}</button>
          {editing && <span className="ml-0.5 flex">
            <button className="icon-btn !h-6 !w-6" aria-label="Move left" onClick={() => move(i, -1)}><ChevronLeft size={13} /></button>
            <button className="icon-btn !h-6 !w-6" aria-label="Move right" onClick={() => move(i, 1)}><ChevronRight size={13} /></button>
            <button className="icon-btn !h-6 !w-6" aria-label="Rename" onClick={() => setDlg({ id: n.id })}><Pencil size={12} /></button>
            <button className="icon-btn !h-6 !w-6" aria-label="Remove" onClick={() => remove(n.id)}><Trash2 size={12} /></button></span>}
        </span>
      ))}
      <button className="icon-btn ml-1 shrink-0" style={{ width: 30, height: 30 }} aria-label="Add category" onClick={() => setDlg({})}><Plus size={16} /></button>
      <button className="icon-btn shrink-0" style={{ width: 30, height: 30 }} aria-label={editing ? 'Done editing categories' : 'Edit categories'} onClick={() => setEditing(!editing)}>{editing ? <Check size={16} /> : <Pencil size={14} />}</button>
      {dlg && <PromptModal title={dlg.id ? 'Rename category' : 'New category'} onClose={() => setDlg(null)} fields={[{ key: 'name', label: 'Name', value: data.nav.find(n => n.id === dlg.id)?.name }]}
        onSubmit={v => { const name = v.name.trim(); if (!name) return;
          if (dlg.id) patch({ nav: data.nav.map(n => n.id === dlg.id ? { ...n, name } : n) });
          else { const id = uid(); patch({ nav: [...data.nav, { id, name }], panels: { ...data.panels, [id]: [] }, activeNav: id }); }
          setDlg(null); }} />}
    </nav>
  );
}
