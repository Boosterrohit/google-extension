# Nova New Tab

A customizable Chrome New Tab dashboard (Manifest V3) built with React, Vite, TypeScript, Tailwind CSS 3.4, Zustand and Lucide.

## Commands
```
yarn install
yarn dev      # develop in the browser at http://localhost:5173 (localStorage fallback)
yarn build    # type-checks, then writes the extension to dist/
```

## Build and install in Chrome
1. Run `yarn install`.
2. Run `yarn build` to type-check the app and create `dist/`.
3. Open `chrome://extensions` and enable **Developer mode**.
4. Click **Load unpacked** and select the `dist` folder.
5. Open a new tab.

To package the production extension on Windows after building:
```powershell
Compress-Archive -Path .\dist\* -DestinationPath .\nova-new-tab.zip -Force
```
The ZIP contains the contents of `dist` at its root, including `manifest.json`.

## Permissions
- `storage`: settings, notes, tasks, and dashboard data.
- `unlimitedStorage`: larger local wallpaper and dashboard data.
- `bookmarks`: display and manage bookmarks when requested by the user.
- `history`: show recent browsing history in the History panel.
- Host access: Open-Meteo geocoding and forecast APIs for weather; RSS2JSON to retrieve user-selected feeds; Google favicon service to display site icons.

See [STORE_LISTING.md](./STORE_LISTING.md) for prepared store copy, permission/privacy disclosures, screenshot checklist, and remaining publication steps.

## Dev mode vs extension
In `yarn dev`, data uses `localStorage`, bookmarks show a sample list and history is unavailable. Everything else works the same.

## Add a template
Add one object to `TEMPLATES` in `src/templates.ts` (background, palette, font, radius, layout, nav, search and shortcut styles). The gallery, preview and dashboard pick it up automatically. User data is stored separately from the template.

## Structure
`src/theme.ts` merges template + user overrides into CSS variables · `src/store.ts` Zustand + persistence · `src/components/*` UI.
