# Nova New Tab

A customizable Chrome New Tab dashboard (Manifest V3) built with React, Vite, TypeScript, Tailwind CSS 3.4, Zustand and Lucide.

## Commands
```
yarn install
yarn dev      # develop in the browser at http://localhost:5173 (localStorage fallback)
yarn build    # type-checks, then writes the extension to dist/
```

## Install in Chrome
1. Run `yarn build` (a prebuilt `dist/` is included in the zip).
2. Open `chrome://extensions`, enable **Developer mode**.
3. Click **Load unpacked** and select the `dist` folder.
4. Open a new tab.

## Permissions
- `storage`, `unlimitedStorage`: settings, notes, tasks, uploaded wallpaper.
- `bookmarks`, `history`: bookmarks panel, recently visited, search suggestions.
- Host access: `api.open-meteo.com` and `geocoding-api.open-meteo.com` (weather, no key needed), `api.rss2json.com` (RSS to JSON for the news widget).

## Dev mode vs extension
In `yarn dev`, data uses `localStorage`, bookmarks show a sample list and history is unavailable. Everything else works the same.

## Add a template
Add one object to `TEMPLATES` in `src/templates.ts` (background, palette, font, radius, layout, nav, search and shortcut styles). The gallery, preview and dashboard pick it up automatically. User data is stored separately from the template.

## Structure
`src/theme.ts` merges template + user overrides into CSS variables · `src/store.ts` Zustand + persistence · `src/components/*` UI.
