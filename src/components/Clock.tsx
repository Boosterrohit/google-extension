import { useEffect, useState } from 'react';
import { CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Sun, MapPin } from 'lucide-react';
import { useStore } from '../store';
export function Clock({ size }: { size: 'lg' | 'sm' }) {
  const { data } = useStore(); const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const parts = new Intl.DateTimeFormat(undefined, { hour: data.hour12 ? 'numeric' : '2-digit', minute: '2-digit', hour12: data.hour12 }).formatToParts(now);
  const time = parts.filter(p => p.type !== 'dayPeriod').map(p => p.value).join('').trim();
  const period = parts.find(p => p.type === 'dayPeriod')?.value;
  const date = data.dateFormat === 'iso' ? now.toLocaleDateString('en-CA')
    : now.toLocaleDateString(undefined, data.dateFormat === 'long' ? { weekday: 'long', month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div>
      <div className={`font-light leading-none tracking-tight tabular-nums ${size === 'lg' ? 'text-7xl sm:text-8xl' : 'text-4xl'}`}>{time}{period && <span className="ml-2 text-2xl opacity-70">{period}</span>}</div>
      <div className="mt-2 text-sm" style={{ color: 'var(--tmuted)' }}>{date}</div>
    </div>
  );
}
interface W { temp: number; code: number; place: string }
const describe = (c: number): [string, typeof Sun] => c === 0 ? ['Clear', Sun] : c <= 2 ? ['Partly cloudy', CloudSun] : c === 3 ? ['Overcast', Cloud] : c <= 48 ? ['Fog', CloudFog] : c <= 67 ? ['Rain', CloudRain] : c <= 77 ? ['Snow', CloudSnow] : c <= 82 ? ['Showers', CloudRain] : ['Thunderstorm', CloudLightning];
export function Weather({ onSetup }: { onSetup: () => void }) {
  const { data } = useStore(); const [w, setW] = useState<W | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!data.city.trim()) { setW(null); return; }
    const key = `nt-weather:${data.city}:${data.unit}`; let dead = false;
    try { const c = JSON.parse(localStorage.getItem(key) || 'null'); if (c && Date.now() - c.t < 15 * 60e3) { setW(c.w); return; } } catch { /* ignore */ }
    (async () => {
      setBusy(true); setErr('');
      try {
        let lat: number, lon: number, place = data.city;
        const m = data.city.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        if (m) { lat = +m[1]; lon = +m[2]; place = 'Current location'; }
        else {
          const g = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.city)}&count=1`)).json();
          if (!g.results?.length) throw new Error('City not found'); lat = g.results[0].latitude; lon = g.results[0].longitude; place = g.results[0].name;
        }
        const r = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=${data.unit === 'f' ? 'fahrenheit' : 'celsius'}`)).json();
        const next = { temp: Math.round(r.current.temperature_2m), code: r.current.weather_code, place };
        localStorage.setItem(key, JSON.stringify({ t: Date.now(), w: next })); if (!dead) setW(next);
      } catch (e) { if (!dead) setErr((e as Error).message === 'City not found' ? 'City not found' : 'Weather unavailable'); }
      finally { if (!dead) setBusy(false); }
    })();
    return () => { dead = true; };
  }, [data.city, data.unit]);
  if (!data.city.trim()) return <button onClick={onSetup} className="inline-flex items-center gap-1.5 self-center rounded-full px-3 py-1 text-sm transition hover:bg-[var(--thover)]" style={{ color: 'var(--tmuted)' }}><MapPin size={14} />Add your location for weather</button>;
  if (err) return <button onClick={onSetup} className="self-center text-sm" style={{ color: 'var(--tmuted)' }}>{err}. Check location</button>;
  if (!w) return <div className="text-sm" style={{ color: 'var(--tmuted)' }}>{busy ? 'Loading weather…' : ''}</div>;
  const [label, Icon] = describe(w.code);
  return <div className="inline-flex items-center gap-2 self-center text-sm"><Icon size={20} /><span className="text-base font-medium">{w.temp}°{data.unit.toUpperCase()}</span><span style={{ color: 'var(--tmuted)' }}>{label} · {w.place}</span></div>;
}
