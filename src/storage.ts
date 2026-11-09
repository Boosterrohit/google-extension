// chrome.storage.local inside the extension, localStorage fallback in `yarn dev`.
export const inExt = () => typeof chrome !== 'undefined' && !!chrome.runtime?.id;
export async function load<T>(key: string): Promise<T | null> {
  try {
    if (inExt()) { const r = await chrome.storage.local.get(key); return (r[key] as T) ?? null; }
    const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null;
  } catch { return null; }
}
export async function save(key: string, value: unknown): Promise<void> {
  try {
    if (inExt()) await chrome.storage.local.set({ [key]: value });
    else localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { console.warn('Could not save', e); }
}
