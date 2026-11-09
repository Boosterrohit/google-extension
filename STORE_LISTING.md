# Chrome Web Store submission preparation

## Listing copy

**Name:** Nova New Tab

**Short description:** A customizable productivity dashboard for your Chrome New Tab.

**Full description:**

Make every new tab a useful workspace. Nova New Tab brings your clock, search, shortcuts, notes, tasks, bookmarks, recent history, weather, news feeds, and music links together in a customizable dashboard.

Choose a built-in template or create your own image/video wallpaper template. Organize shortcut panels, adjust appearance and layout, and keep notes and tasks saved in your browser profile.

Nova New Tab stores dashboard data locally. Optional weather and news features contact the services described in the privacy disclosures below. No account is required.

**Feature highlights:**

- Customizable new-tab dashboard with built-in and user-created templates.
- Shortcuts, bookmark browsing, notes, and prioritized tasks.
- Optional clock, weather, RSS news, recent history, and music links.
- Appearance controls for wallpaper, theme, color, layout, and widgets.
- Local backup export and restore.

## Permission justifications

| Permission | User-facing purpose |
|---|---|
| `storage` | Save dashboard settings, shortcuts, notes, tasks, and preferences in the user's extension profile. |
| `unlimitedStorage` | Support user-selected wallpaper media and larger local dashboard data without the standard extension storage quota. |
| `bookmarks` | Read bookmarks for the Bookmarks panel and create or remove bookmarks/folders when the user requests those actions. |
| `history` | Read recent browser history for the optional History panel. The UI requests a limited recent result set and does not modify browser history. |
| `https://api.open-meteo.com/*` | Retrieve weather for the city or coordinates the user configures. |
| `https://geocoding-api.open-meteo.com/*` | Resolve a configured city name to coordinates for weather. |
| `https://api.rss2json.com/*` | Retrieve and convert RSS feeds configured by the user. The feed URL is sent to this third-party service. |
| `https://www.google.com/*` | Retrieve site favicons. The requested site hostname may be sent to Google's favicon service. |

No background service worker is needed; the dashboard runs in the New Tab override. The extension's page CSP permits only packaged scripts and objects and does not allow `eval` or remote scripts.

## Privacy disclosures and policy draft

Use the following as a starting point for a publicly hosted privacy policy. Replace the contact placeholder, verify it against the release build and the Chrome Web Store's then-current policies, and publish it at a stable URL before submission. This draft is not a substitute for legal review.

### Information stored locally

Nova New Tab stores dashboard preferences and content, including shortcuts, notes, tasks, selected templates, and appearance settings, in Chrome extension storage in the user's browser profile. Uploaded template media is stored in the browser's local IndexedDB. The extension does not operate an account or its own server for this information. The dashboard's backup export is a local file the user chooses to create.

### Information sent to other services

- When the user configures weather, the configured city name or coordinates and temperature unit are sent to Open-Meteo's geocoding and forecast services.
- When the user enables or refreshes news, configured RSS feed URLs are sent to RSS2JSON, which retrieves feed content. Feed providers and RSS2JSON may process requests under their own privacy policies.
- Site hostnames may be sent to Google's favicon service to display icons.
- Search terms and clicked links are sent to the search engine or destination selected by the user. Playing an embedded YouTube link connects to YouTube.

These are user-facing, optional features. No advertising, analytics, or account system is included in the project. Network services have their own privacy policies and may log requests; link to their policies in the hosted policy if required by the final release.

### Retention and deletion

Local dashboard data remains in the browser profile until the user removes it, clears extension data, or uninstalls the extension. Users can delete individual notes, tasks, shortcuts, and custom templates in the UI and can erase dashboard data through the provided settings. Requests already received by third-party services are governed by those services' retention practices.

### Contact

Privacy questions: **[replace with a monitored contact email before publication]**

## Store assets checklist

- The project includes 16×16, 48×48, and 128×128 PNG extension icons in `public/`.
- Capture genuine screenshots from the production build; do not use mockups. Suggested set: dashboard, template gallery (including a custom template), appearance controls, and notes/tasks or bookmarks.
- Prepare screenshots at the Chrome Web Store's currently accepted dimensions and count. Verify the current requirements in the developer dashboard before submission.
- Provide a public privacy policy URL and complete the Web Store privacy/data-use disclosures consistently with the policy and the network disclosures above.
- Review the listing, permission justifications, icons, and screenshots in the developer dashboard before publishing.

## Build, package, and load locally

```sh
yarn install
yarn build
```

On Windows, create `nova-new-tab.zip` with `manifest.json` at the archive root:

```powershell
Compress-Archive -Path .\dist\* -DestinationPath .\nova-new-tab.zip -Force
```

To test unpacked, visit `chrome://extensions/`, enable **Developer mode**, choose **Load unpacked**, and select the `dist` directory. Open a new tab to verify the override.

## Still required before publication

- Replace the privacy contact placeholder and publish the privacy policy at a stable public URL.
- Capture and upload the required production screenshots.
- Confirm final privacy/data-use answers and listing requirements in the Chrome Web Store dashboard.
- Complete any developer account verification, applicable registration/payment, and manual review steps. These require the publisher's account and cannot be completed from this project workspace.
