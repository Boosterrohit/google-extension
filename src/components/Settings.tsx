import { useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { ENGINES, PRESETS, defaultData, defaultPanels } from '../defaults';
import { Data } from '../types';
import { getTemplate } from '../templates';
import { inExt } from '../storage';
import { Modal, Row, Seg } from './ui';
import { AppearancePanel, WidgetToggles } from './Appearance';
export const TABS = ['General', 'Appearance', 'Templates', 'Search', 'Shortcuts', 'Widgets', 'Data and Backup', 'About'] as const;
export type Tab = typeof TABS[number];
export function Settings({ tab: t0, onClose, openGallery }: { tab: Tab; onClose: () => void; openGallery: () => void }) {
  const { data, patch } = useStore(); const [tab, setTab] = useState<Tab>(t0);
  const [city, setCity] = useState(data.city);
  const exportData = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'nova-newtab-backup.json'; a.click(); URL.revokeObjectURL(a.href); };
  const importData = async (f?: File) => { if (!f) return; try { const j = JSON.parse(await f.text()) as Partial<Data>; if (!j.templateId || !j.panels) throw new Error(); const b = defaultData(); patch({ ...b, ...j, appearance: { ...b.appearance, ...j.appearance }, widgets: { ...b.widgets, ...j.widgets }, onboarded: true }); alert('Backup restored.'); } catch { alert('That file is not a valid Nova backup.'); } };
  const geo = () => navigator.geolocation.getCurrentPosition(p => { const v = `${p.coords.latitude.toFixed(3)},${p.coords.longitude.toFixed(3)}`; setCity(v); patch({ city: v }); }, () => alert('Location permission was denied. Type a city instead.'));
  return (
    <Modal title="Settings" wide onClose={onClose}>
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex gap-1 overflow-x-auto sm:w-44 sm:shrink-0 sm:flex-col">{TABS.map(x => <button key={x} onClick={() => setTab(x)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${x === tab ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--hover)]'}`}>{x}</button>)}</div>
        <div className="min-h-[360px] flex-1">
          {tab === 'General' && <div>
            <Row label="Time format"><Seg value={data.hour12 ? 12 : 24} onChange={v => patch({ hour12: v === 12 })} options={[{ v: 12, l: '12-hour' }, { v: 24, l: '24-hour' }]} /></Row>
            <Row label="Date format"><Seg value={data.dateFormat} onChange={dateFormat => patch({ dateFormat })} options={[{ v: 'long', l: 'Monday, May 4' }, { v: 'short', l: 'May 4, 2026' }, { v: 'iso', l: '2026-05-04' }]} /></Row>
            <Row label="Temperature unit"><Seg value={data.unit} onChange={unit => patch({ unit })} options={[{ v: 'c', l: '°C' }, { v: 'f', l: '°F' }]} /></Row>
            <div className="py-2"><label className="text-sm">Weather location</label><p className="muted mb-2 text-xs">Uses free Open-Meteo data. No API key needed.</p>
              <div className="flex gap-2"><input className="input" placeholder="City, e.g. Kathmandu" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && patch({ city: city.trim() })} /><button className="btn-primary" onClick={() => patch({ city: city.trim() })}>Save</button><button className="btn" onClick={geo}>Use mine</button></div></div></div>}
          {tab === 'Appearance' && <AppearancePanel />}
          {tab === 'Templates' && <div className="space-y-3"><p className="text-sm">Current template: <b>{getTemplate(data.templateId, data.customTemplates).name}</b></p><p className="muted text-sm">Switching templates never touches your shortcuts, notes, or tasks.</p><button className="btn-primary" onClick={() => { onClose(); openGallery(); }}>Browse templates</button></div>}
          {tab === 'Search' && <div className="space-y-2"><p className="mb-1 text-sm">Default search engine</p>
            {ENGINES.map(e => <label key={e.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-[var(--hover)]"><input type="radio" name="eng" className="accent-[var(--accent)]" checked={data.engine === e.id} onChange={() => patch({ engine: e.id })} />{e.name}</label>)}
            <div className="pt-2"><label className="muted text-xs">Custom search URL (use %s for the query)</label><input className="input mt-1" placeholder="https://example.com/search?q=%s" value={data.customEngineUrl} onChange={e => patch({ customEngineUrl: e.target.value })} /></div>
            <button className="btn mt-2" onClick={() => patch({ recent: [] })}>Clear recent searches ({data.recent.length})</button></div>}
          {tab === 'Shortcuts' && <div className="space-y-3"><p className="muted text-sm">Add a ready-made panel to “{data.nav.find(n => n.id === data.activeNav)?.name}”.</p>
            <div className="flex flex-wrap gap-2">{Object.keys(PRESETS).map(k => <button key={k} className="btn" onClick={() => patch({ panels: { ...data.panels, [data.activeNav]: [...(data.panels[data.activeNav] ?? []), PRESETS[k]()] } })}>+ {k}</button>)}</div>
            <button className="btn flex items-center gap-2" onClick={() => confirm('Restore all shortcut panels to the defaults? Your custom shortcuts will be replaced.') && patch({ panels: defaultPanels() })}>Restore default shortcuts</button></div>}
          {tab === 'Widgets' && <WidgetToggles />}
          {tab === 'Data and Backup' && <div className="space-y-3"><p className="muted text-sm">Everything is stored {inExt() ? 'in this browser profile' : 'in localStorage (dev mode)'}. Back it up as a JSON file.</p>
            <div className="flex flex-wrap gap-2"><button className="btn flex items-center gap-2" onClick={exportData}><Download size={14} />Export backup</button>
              <label className="btn flex cursor-pointer items-center gap-2"><Upload size={14} />Import backup<input type="file" accept="application/json" className="hidden" onChange={e => { void importData(e.target.files?.[0]); e.target.value = ''; }} /></label>
              <button className="btn flex items-center gap-2 !text-red-500" onClick={() => { if (confirm('Erase all data and start over?')) { patch({ ...defaultData() }); onClose(); } }}><Trash2 size={14} />Erase everything</button></div></div>}
          {tab === 'About' && <div className="space-y-2 text-sm"><p className="text-base font-semibold">Nova New Tab</p><p className="muted">Version {inExt() ? chrome.runtime.getManifest().version : 'dev'} · Built with React, Vite, TypeScript, Tailwind and Zustand.</p>
            <p className="muted">Bookmarks and history are read locally through Chrome's APIs. Weather and news are the only network requests, and both are optional.</p></div>}
        </div>
      </div>
    </Modal>
  );
}
