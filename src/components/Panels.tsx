import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Play, Pause, ExternalLink, Folder, FolderPlus, Search, StickyNote, ListChecks, Music2, Newspaper, History as Hist, Bookmark, RefreshCw, X } from 'lucide-react';
import { useStore } from '../store';
import { uid } from '../defaults';
import { inExt } from '../storage';
import { Task } from '../types';
import { Empty, Favicon } from './ui';

/* ---------- Notes ---------- */
export function NotesPanel() {
  const { data, patch } = useStore(); const [sel, setSel] = useState<string | null>(data.notes[0]?.id ?? null);
  const note = data.notes.find(n => n.id === sel);
  const upd = (p: { title?: string; body?: string }) => patch({ notes: data.notes.map(n => n.id === sel ? { ...n, ...p, updated: Date.now() } : n) });
  const add = () => { const n = { id: uid(), title: '', body: '', updated: Date.now() }; patch({ notes: [n, ...data.notes] }); setSel(n.id); };
  const del = () => { const rest = data.notes.filter(n => n.id !== sel); patch({ notes: rest }); setSel(rest[0]?.id ?? null); };
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2"><button className="btn-primary flex items-center gap-1.5" onClick={add}><Plus size={14} />New note</button>{note && <button className="btn flex items-center gap-1.5" onClick={del}><Trash2 size={14} />Delete</button>}</div>
      {data.notes.length === 0 ? <Empty icon={<StickyNote size={28} />} title="No notes yet" hint="Notes save automatically as you type." /> : <>
        <div className="flex max-h-28 flex-wrap gap-1.5 overflow-auto">{data.notes.map(n => <button key={n.id} onClick={() => setSel(n.id)} className={`max-w-full truncate rounded-lg px-3 py-1.5 text-xs ${n.id === sel ? 'bg-[var(--accent)] text-white' : 'bg-[var(--hover)]'}`}>{n.title || n.body.slice(0, 24) || 'Untitled'}</button>)}</div>
        {note && <div className="flex min-h-0 flex-1 flex-col gap-2"><input className="input font-medium" placeholder="Title" value={note.title} onChange={e => upd({ title: e.target.value })} />
          <textarea className="input min-h-[200px] flex-1 resize-none leading-relaxed" placeholder="Write something…" value={note.body} onChange={e => upd({ body: e.target.value })} />
          <p className="muted text-xs">Saved automatically · {new Date(note.updated).toLocaleString()}</p></div>}
      </>}
    </div>
  );
}

/* ---------- Tasks ---------- */
const ORDER = { high: 0, medium: 1, low: 2 }; const COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
export function TasksPanel() {
  const { data, patch } = useStore(); const [text, setText] = useState(''); const [pr, setPr] = useState<Task['priority']>('medium');
  const add = () => { if (!text.trim()) return; patch({ tasks: [...data.tasks, { id: uid(), text: text.trim(), done: false, priority: pr }] }); setText(''); };
  const tasks = [...data.tasks].sort((a, b) => Number(a.done) - Number(b.done) || ORDER[a.priority] - ORDER[b.priority]);
  const set = (id: string, p: Partial<Task>) => patch({ tasks: data.tasks.map(t => t.id === id ? { ...t, ...p } : t) });
  const cycle = (p: Task['priority']): Task['priority'] => p === 'high' ? 'medium' : p === 'medium' ? 'low' : 'high';
  return (
    <div className="space-y-3">
      <form className="flex gap-2 mt-1" onSubmit={e => { e.preventDefault(); add(); }}>
        <input className="input" placeholder="Add a task" value={text} onChange={e => setText(e.target.value)} />
        <select className="input !w-28" aria-label="Priority" value={pr} onChange={e => setPr(e.target.value as Task['priority'])}><option value="high" className='text-black'>High</option><option value="medium" className='text-black'>Medium</option><option value="low" className='text-black'>Low</option></select>
        <button className="btn-primary" aria-label="Add task"><Plus size={16} /></button>
      </form>
      {tasks.length === 0 ? <Empty icon={<ListChecks size={28} />} title="Nothing to do" hint="Add a task and set its priority." /> :
        <ul className="space-y-1">{tasks.map(t => (
          <li key={t.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--hover)]">
            <button role="checkbox" aria-checked={t.done} aria-label="Mark complete" onClick={() => set(t.id, { done: !t.done })} className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${t.done ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--muted)]'}`}>{t.done && <span className="text-[10px]">✓</span>}</button>
            <span className={`flex-1 text-sm ${t.done ? 'muted line-through' : ''}`}>{t.text}</span>
            <button title="Change priority" onClick={() => set(t.id, { priority: cycle(t.priority) })} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: COLORS[t.priority] + '26', color: COLORS[t.priority] }}>{t.priority}</button>
            <button className="icon-btn opacity-0 group-hover:opacity-100" aria-label="Delete task" onClick={() => patch({ tasks: data.tasks.filter(x => x.id !== t.id) })}><X size={14} /></button>
          </li>))}</ul>}
      {data.tasks.some(t => t.done) && <button className="btn" onClick={() => patch({ tasks: data.tasks.filter(t => !t.done) })}>Clear completed</button>}
    </div>
  );
}

/* ---------- Music ---------- */
const audio = new Audio(); let currentId = '';
const ytId = (u: string) => u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];
const isAudio = (u: string) => /\.(mp3|ogg|wav|m4a|aac|flac|opus)(\?|$)/i.test(u);
export function MusicPanel() {
  const { data, patch } = useStore(); const [title, setTitle] = useState(''); const [url, setUrl] = useState(''); const [playing, setPlaying] = useState(!audio.paused); const [yt, setYt] = useState('');
  useEffect(() => { const s = () => setPlaying(!audio.paused); audio.addEventListener('play', s); audio.addEventListener('pause', s); audio.addEventListener('ended', s); return () => { audio.removeEventListener('play', s); audio.removeEventListener('pause', s); audio.removeEventListener('ended', s); }; }, []);
  const toggle = (t: { id: string; url: string }) => {
    const y = ytId(t.url);
    if (y) { audio.pause(); setYt(yt === t.id ? '' : t.id); return; }
    if (isAudio(t.url)) { setYt(''); if (currentId === t.id && !audio.paused) audio.pause(); else { if (currentId !== t.id) { audio.src = t.url; currentId = t.id; } void audio.play().catch(() => alert('This audio file could not be played.')); } return; }
    window.open(t.url, '_blank', 'noopener');
  };
  const add = () => { if (!url.trim()) return; const u = /^https?:/.test(url) ? url.trim() : `https://${url.trim()}`; patch({ tracks: [...data.tracks, { id: uid(), title: title.trim() || u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40), url: u }] }); setTitle(''); setUrl(''); };
  const ytTrack = data.tracks.find(t => t.id === yt);
  return (
    <div className="space-y-3">
      <form className="space-y-2 mt-2" onSubmit={e => { e.preventDefault(); add(); }}>
        <input className="input" placeholder="Link (MP3, YouTube, or any page)" value={url} onChange={e => setUrl(e.target.value)} />
        <div className="flex gap-2"><input className="input" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} /><button className="btn-primary">Add</button></div>
      </form>
      {ytTrack && ytId(ytTrack.url) && <iframe title={ytTrack.title} className="aspect-video w-full rounded-xl" src={`https://www.youtube.com/embed/${ytId(ytTrack.url)}?autoplay=1`} allow="autoplay; encrypted-media" />}
      {data.tracks.length === 0 ? <Empty icon={<Music2 size={28} />} title="No music yet" hint="Paste a direct audio file or YouTube link. Other links open in a new tab." /> :
        <ul className="space-y-1">{data.tracks.map(t => { const on = (currentId === t.id && playing) || yt === t.id; const ext = !ytId(t.url) && !isAudio(t.url); return (
          <li key={t.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--hover)]">
            <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white" aria-label={on ? 'Pause' : ext ? 'Open' : 'Play'} onClick={() => toggle(t)}>{ext ? <ExternalLink size={14} /> : on ? <Pause size={14} /> : <Play size={14} />}</button>
            <span className="flex-1 truncate text-sm">{t.title}</span>
            <button className="icon-btn opacity-0 group-hover:opacity-100" aria-label="Remove track" onClick={() => { if (currentId === t.id) { audio.pause(); currentId = ''; } if (yt === t.id) setYt(''); patch({ tracks: data.tracks.filter(x => x.id !== t.id) }); }}><Trash2 size={14} /></button>
          </li>); })}</ul>}
    </div>
  );
}

/* ---------- News ---------- */
interface Article { title: string; link: string; source: string; date: number }
export function NewsPanel() {
  const { data, patch } = useStore(); const [items, setItems] = useState<Article[]>([]); const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading'); const [feed, setFeed] = useState(''); const [tick, setTick] = useState(0);
  useEffect(() => {
    let dead = false; setState('loading');
    Promise.allSettled(data.feeds.map(async f => { const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f)}`); const j = await r.json(); if (j.status !== 'ok') throw new Error('bad feed');
      return (j.items as { title: string; link: string; pubDate: string }[]).slice(0, 8).map(i => ({ title: i.title, link: i.link, source: j.feed.title as string, date: Date.parse(i.pubDate.replace(' ', 'T') + 'Z') || 0 })); }))
      .then(r => { if (dead) return; const all = r.flatMap(x => x.status === 'fulfilled' ? x.value : []).sort((a, b) => b.date - a.date); setItems(all); setState(all.length || !data.feeds.length ? 'ok' : 'error'); });
    return () => { dead = true; };
  }, [data.feeds, tick]);
  return (
    <div className="space-y-3 mt-2">
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (feed.trim()) { patch({ feeds: [...data.feeds, feed.trim()] }); setFeed(''); } }}>
        <input className="input" placeholder="Add RSS feed URL" value={feed} onChange={e => setFeed(e.target.value)} /><button className="btn-primary">Add</button><button type="button" className="btn" aria-label="Refresh" onClick={() => setTick(tick + 1)}><RefreshCw size={14} /></button>
      </form>
      <div className="flex flex-wrap gap-1.5">{data.feeds.map(f => <span key={f} className="flex items-center gap-1 rounded-full bg-[var(--hover)] py-1 pl-3 pr-1.5 text-xs"><span className="max-w-[170px] truncate">{f.replace(/^https?:\/\//, '')}</span><button aria-label="Remove feed" onClick={() => patch({ feeds: data.feeds.filter(x => x !== f) })}><X size={12} /></button></span>)}</div>
      {state === 'loading' ? <p className="muted py-8 text-center text-sm">Loading articles…</p> : state === 'error' ? <Empty icon={<Newspaper size={28} />} title="Couldn't load these feeds" hint="Check your connection or the feed URLs, then refresh." /> : items.length === 0 ? <Empty icon={<Newspaper size={28} />} title="No feeds yet" hint="Add an RSS feed URL above." /> :
        <ul className="space-y-1">{items.map(a => <li key={a.link}><a href={a.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-2 py-2 hover:bg-[var(--hover)]"><p className="text-sm leading-snug">{a.title}</p><p className="muted mt-0.5 text-xs">{a.source}{a.date ? ` · ${new Date(a.date).toLocaleDateString()}` : ''}</p></a></li>)}</ul>}
    </div>
  );
}

/* ---------- History ---------- */
export function HistoryPanel() {
  const [items, setItems] = useState<{ title: string; url: string }[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => {
    if (!inExt()) { setLoading(false); return; }
    chrome.history.search({ text: '', maxResults: 60, startTime: Date.now() - 14 * 864e5 }).then(r => { const seen = new Set<string>(); setItems(r.filter(x => x.url && !seen.has(x.url) && seen.add(x.url)).slice(0, 40).map(x => ({ title: x.title || x.url!, url: x.url! }))); }).catch(e => { console.error('Could not read browser history.', e); setError(true); }).finally(() => setLoading(false));
  }, []);
  if (loading) return <p className="muted py-8 text-center text-sm">Loading…</p>;
  if (!inExt()) return <Empty icon={<Hist size={28} />} title="History is available in the extension" hint="Install the built extension to see recently visited sites." />;
  if (error) return <Empty icon={<Hist size={28} />} title="Could not access browsing history" hint="Check that Nova New Tab has the History permission in chrome://extensions." />;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="muted text-xs">Last 14 days</p>{items.length > 0 && <button className="btn" onClick={() => setItems([])}>Clear list</button>}</div>
      {items.length === 0 ? <Empty icon={<Hist size={28} />} title="Nothing to show" hint="Clearing only hides this list. Your browser history is untouched." /> :
        <ul className="space-y-0.5">{items.map(i => <li key={i.url}><a href={i.url} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--hover)]"><Favicon url={i.url} size={18} /><span className="min-w-0"><span className="block truncate text-sm">{i.title}</span><span className="muted block truncate text-xs">{i.url}</span></span></a></li>)}</ul>}
    </div>
  );
}

/* ---------- Bookmarks ---------- */
interface BM { id: string; title: string; url?: string; children?: BM[] }
const DEV_KEY = 'nt-dev-bm';
const devLoad = (): BM[] => { try { return JSON.parse(localStorage.getItem(DEV_KEY) || 'null') ?? [{ id: '1', title: 'Bookmarks bar', children: [{ id: 'd1', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' }] }]; } catch { return []; } };
const bmApi = {
  tree: async (): Promise<BM[]> => inExt() ? ((await chrome.bookmarks.getTree())[0].children ?? []) as BM[] : devLoad(),
  add: async (parentId: string, title: string, url?: string) => {
    if (inExt()) { await chrome.bookmarks.create({ parentId, title, url }); return; }
    const walk = (n: BM[]): BM[] => n.map(b => b.id === parentId ? { ...b, children: [...(b.children ?? []), { id: uid(), title, url, children: url ? undefined : [] }] } : b.children ? { ...b, children: walk(b.children) } : b);
    localStorage.setItem(DEV_KEY, JSON.stringify(walk(devLoad())));
  },
  remove: async (id: string, folder: boolean) => {
    if (inExt()) { folder ? await chrome.bookmarks.removeTree(id) : await chrome.bookmarks.remove(id); return; }
    const walk = (n: BM[]): BM[] => n.filter(b => b.id !== id).map(b => b.children ? { ...b, children: walk(b.children) } : b);
    localStorage.setItem(DEV_KEY, JSON.stringify(walk(devLoad())));
  },
};
const folders = (n: BM[], d = 0): { id: string; label: string }[] => n.flatMap(b => b.children ? [{ id: b.id, label: '\u00a0\u00a0'.repeat(d) + b.title }, ...folders(b.children, d + 1)] : []);
const filter = (n: BM[], q: string): BM[] => n.flatMap(b => b.children ? (() => { const c = filter(b.children, q); return c.length ? [{ ...b, children: c }] : []; })() : (b.title + (b.url ?? '')).toLowerCase().includes(q) ? [b] : []);
export function BookmarksPanel() {
  const [tree, setTree] = useState<BM[]>([]); const [q, setQ] = useState(''); const [open, setOpen] = useState<Record<string, boolean>>({}); const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: '', url: '', parent: '', folder: '' }); const [err, setErr] = useState('');
  const reload = useCallback(() => bmApi.tree().then(setTree).catch(() => setErr('Could not read bookmarks.')), []);
  useEffect(() => { void reload(); }, [reload]);
  const fl = folders(tree); const shown = q.trim() ? filter(tree, q.toLowerCase()) : tree;
  const submit = async () => { const parent = f.parent || fl[0]?.id; if (!parent) return; try { if (f.folder.trim()) await bmApi.add(parent, f.folder.trim()); else if (f.url.trim()) await bmApi.add(parent, f.title.trim() || f.url, /^https?:/.test(f.url) ? f.url.trim() : `https://${f.url.trim()}`); setF({ title: '', url: '', parent: f.parent, folder: '' }); setAdding(false); await reload(); } catch { setErr('Could not save that bookmark.'); } };
  const render = (nodes: BM[], depth = 0): ReactNode => nodes.map(b => b.children ? (
    <li key={b.id}><div className="group flex items-center rounded-lg hover:bg-[var(--hover)]" style={{ paddingLeft: depth * 12 }}><button className="flex flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm font-medium" onClick={() => setOpen({ ...open, [b.id]: !(open[b.id] ?? true) })}><Folder size={15} className="muted" />{b.title || 'Untitled folder'}<span className="muted text-xs">{b.children.length}</span></button>
      {depth > 0 && <button className="icon-btn mr-1 opacity-0 group-hover:opacity-100" aria-label="Delete folder" onClick={() => confirm('Delete this folder and everything in it?') && bmApi.remove(b.id, true).then(reload)}><Trash2 size={13} /></button>}</div>
      {(q || (open[b.id] ?? true)) && <ul>{render(b.children, depth + 1)}</ul>}</li>) : (
    <li key={b.id} className="group flex items-center rounded-lg hover:bg-[var(--hover)]" style={{ paddingLeft: depth * 12 }}><a href={b.url} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm"><Favicon url={b.url!} size={16} /><span className="truncate">{b.title || b.url}</span></a>
      <button className="icon-btn mr-1 opacity-0 group-hover:opacity-100" aria-label="Delete bookmark" onClick={() => bmApi.remove(b.id, false).then(reload)}><Trash2 size={13} /></button></li>));
  return (
    <div className="space-y-3">
      <div className="flex gap-2"><div className="relative flex-1"><Search size={14} className="muted absolute left-3 top-1/2 -translate-y-1/2" /><input className="input !pl-8" placeholder="Search bookmarks" value={q} onChange={e => setQ(e.target.value)} /></div><button className="btn" aria-label="Add bookmark or folder" onClick={() => setAdding(!adding)}><FolderPlus size={15} /></button></div>
      {adding && <div className="space-y-2 rounded-xl bg-[var(--hover)] p-3">
        <select className="input" aria-label="Folder" value={f.parent} onChange={e => setF({ ...f, parent: e.target.value })}>{fl.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
        <input className="input" placeholder="Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /><input className="input" placeholder="Address" value={f.url} onChange={e => setF({ ...f, url: e.target.value })} />
        <input className="input" placeholder="…or a new folder name" value={f.folder} onChange={e => setF({ ...f, folder: e.target.value })} />
        <div className="flex justify-end"><button className="btn-primary" onClick={() => void submit()}>Save</button></div></div>}
      {!inExt() && <p className="muted text-xs">Preview mode: showing sample bookmarks. Your real bookmarks appear in the installed extension.</p>}
      {err ? <Empty icon={<Bookmark size={28} />} title={err} /> : shown.length === 0 ? <Empty icon={<Bookmark size={28} />} title={q ? 'No matching bookmarks' : 'No bookmarks yet'} /> : <ul>{render(shown)}</ul>}
    </div>
  );
}
