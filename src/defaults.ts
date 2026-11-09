import { Appearance, Data, Panel } from './types';
export const uid = () => Math.random().toString(36).slice(2, 9);
const P = (title: string, items: [string, string][]): Panel => ({ id: uid(), title, items: items.map(([t, u]) => ({ id: uid(), title: t, url: u })) });
export const PRESETS: Record<string, () => Panel> = {
  Streaming: () => P('Streaming', [['YouTube', 'https://youtube.com'], ['Netflix', 'https://netflix.com'], ['Twitch', 'https://twitch.tv'], ['Spotify', 'https://open.spotify.com'], ['Prime Video', 'https://primevideo.com'], ['Disney+', 'https://disneyplus.com']]),
  Gaming: () => P('Gaming', [['Steam', 'https://store.steampowered.com'], ['Epic Games', 'https://store.epicgames.com'], ['IGN', 'https://ign.com'], ['GOG', 'https://gog.com'], ['Xbox', 'https://xbox.com'], ['PlayStation', 'https://playstation.com']]),
  'Tech News': () => P('Tech News', [['The Verge', 'https://theverge.com'], ['TechCrunch', 'https://techcrunch.com'], ['Hacker News', 'https://news.ycombinator.com'], ['Ars Technica', 'https://arstechnica.com'], ['Wired', 'https://wired.com'], ['Engadget', 'https://engadget.com']]),
  'Social Media': () => P('Social Media', [['X', 'https://x.com'], ['Reddit', 'https://reddit.com'], ['Instagram', 'https://instagram.com'], ['LinkedIn', 'https://linkedin.com'], ['Facebook', 'https://facebook.com'], ['Discord', 'https://discord.com']]),
  Development: () => P('Development', [['GitHub', 'https://github.com'], ['Stack Overflow', 'https://stackoverflow.com'], ['MDN', 'https://developer.mozilla.org'], ['npm', 'https://npmjs.com'], ['Vercel', 'https://vercel.com'], ['CodePen', 'https://codepen.io']]),
  Productivity: () => P('Productivity', [['Gmail', 'https://mail.google.com'], ['Drive', 'https://drive.google.com'], ['Notion', 'https://notion.so'], ['Calendar', 'https://calendar.google.com'], ['Trello', 'https://trello.com'], ['Figma', 'https://figma.com']]),
  Education: () => P('Education', [['Coursera', 'https://coursera.org'], ['Khan Academy', 'https://khanacademy.org'], ['Udemy', 'https://udemy.com'], ['Wikipedia', 'https://wikipedia.org'], ['edX', 'https://edx.org'], ['Duolingo', 'https://duolingo.com']]),
  Shopping: () => P('Shopping', [['Amazon', 'https://amazon.com'], ['eBay', 'https://ebay.com'], ['AliExpress', 'https://aliexpress.com'], ['Etsy', 'https://etsy.com'], ['Walmart', 'https://walmart.com'], ['Best Buy', 'https://bestbuy.com']]),
};
export const ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
  { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p=%s' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' },
  { id: 'custom', name: 'Custom', url: '' },
];
export const GRADIENTS = [
  'linear-gradient(135deg,#1e1b4b,#7c3aed 55%,#f472b6)', 'linear-gradient(135deg,#0f172a,#0e7490 60%,#34d399)',
  'linear-gradient(135deg,#2b0f3a,#be185d 55%,#fb923c)', 'linear-gradient(135deg,#111827,#374151 60%,#9ca3af)',
  'linear-gradient(135deg,#0c4a6e,#38bdf8 60%,#e0f2fe)', 'linear-gradient(135deg,#052e16,#15803d 60%,#bef264)',
];
export const defaultAppearance = (): Appearance => ({
  bgMode: 'template', bgColor: '#0f172a', bgGradient: GRADIENTS[0], bgImage: '', blur: 0, brightness: 100,
  opacity: null, radius: null, shadow: 2, font: null, fontSize: 15, accent: null, theme: 'template',
  searchPos: 'center', clockPos: 'center', columns: null,
});
export const NAV_DEFAULT = [['home', 'Home'], ['dev', 'Dev & Code'], ['work', 'Work'], ['daily', 'Daily'], ['news', 'News & Reading'], ['fun', 'Entertainment'], ['shop', 'Shopping'], ['learn', 'Learning'], ['space', 'Workspace']].map(([id, name]) => ({ id, name }));
export const defaultPanels = (): Record<string, Panel[]> => ({
  home: Object.keys(PRESETS).map(k => PRESETS[k]()),
  dev: [PRESETS.Development(), PRESETS['Tech News']()], work: [PRESETS.Productivity()], daily: [PRESETS['Social Media']()],
  news: [PRESETS['Tech News']()], fun: [PRESETS.Streaming(), PRESETS.Gaming()], shop: [PRESETS.Shopping()],
  learn: [PRESETS.Education()], space: [],
});
export const defaultData = (): Data => ({
  onboarded: false, templateId: 'classic-chrome', engine: 'google', customEngineUrl: '', hour12: false, dateFormat: 'long',
  customTemplates: [],
  city: '', unit: 'c', nav: NAV_DEFAULT, activeNav: 'home', panels: defaultPanels(), notes: [], tasks: [], tracks: [],
  feeds: ['https://feeds.bbci.co.uk/news/technology/rss.xml', 'https://hnrss.org/frontpage'], recent: [],
  appearance: defaultAppearance(), widgets: { clock: true, weather: true, search: true, shortcuts: true },
});
