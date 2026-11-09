export type Cat = 'Classic' | 'Minimal' | 'Modern' | 'Nature' | 'Productivity' | 'Gaming' | 'Anime' | 'Cinematic';
export type FontKey = 'sans' | 'serif' | 'mono' | 'rounded';
export interface Template {
  id: string; name: string; description: string; category: Cat;
  dark: boolean; onBg: 'light' | 'dark'; bg: string; accent: string; font: FontKey;
  radius: number; opacity: number; cardBlur: number;
  layout: 'center' | 'split' | 'classic'; nav: 'pill' | 'underline' | 'plain';
  search: 'pill' | 'box'; shortcuts: 'cards' | 'tiles'; columns: number;
  customMedia?: 'image' | 'video';
}
export interface Shortcut { id: string; title: string; url: string; icon?: string }
export interface Panel { id: string; title: string; items: Shortcut[] }
export interface NavCat { id: string; name: string }
export interface Note { id: string; title: string; body: string; updated: number }
export interface Task { id: string; text: string; done: boolean; priority: 'high' | 'medium' | 'low' }
export interface Track { id: string; title: string; url: string }
export interface Appearance {
  bgMode: 'template' | 'color' | 'gradient' | 'image' | 'video'; bgColor: string; bgGradient: string; bgImage: string;
  blur: number; brightness: number; opacity: number | null; radius: number | null; shadow: 0 | 1 | 2 | 3;
  font: FontKey | null; fontSize: number; accent: string | null; theme: 'template' | 'light' | 'dark';
  searchPos: 'top' | 'center'; clockPos: 'left' | 'center' | 'right'; columns: number | null;
}
export type WidgetKey = 'clock' | 'weather' | 'search' | 'shortcuts';
export interface Data {
  onboarded: boolean; templateId: string; engine: string; customEngineUrl: string;
  customTemplates: Template[];
  hour12: boolean; dateFormat: 'long' | 'short' | 'iso'; city: string; unit: 'c' | 'f';
  nav: NavCat[]; activeNav: string; panels: Record<string, Panel[]>;
  notes: Note[]; tasks: Task[]; tracks: Track[]; feeds: string[]; recent: string[];
  appearance: Appearance; widgets: Record<WidgetKey, boolean>;
}
