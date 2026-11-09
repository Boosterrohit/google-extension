import { ReactNode, useRef, useState } from "react";
import {
  Search,
  Bookmark,
  Puzzle,
  StickyNote,
  ListChecks,
  Music2,
  Newspaper,
  History,
  Palette,
  Settings as Cog,
  LayoutTemplate,
  X,
} from "lucide-react";
import { useStore } from "../store";
import { getTemplate } from "../templates";
import { look } from "../theme";
import { inExt } from "../storage";
import { Nav } from "./Nav";
import { SearchBar } from "./Search";
import { Clock, Weather } from "./Clock";
import { Shortcuts } from "./Shortcuts";
import {
  BookmarksPanel,
  HistoryPanel,
  MusicPanel,
  NewsPanel,
  NotesPanel,
  TasksPanel,
} from "./Panels";
import { AppearancePanel } from "./Appearance";
import { Settings, Tab } from "./Settings";
import Gallery from "./Gallery";
import TemplateBackground from "./TemplateBackground";
type DrawerKey =
  | "bookmarks"
  | "notes"
  | "tasks"
  | "music"
  | "news"
  | "history"
  | "appearance";
const DRAWERS: Record<DrawerKey, { title: string; node: () => ReactNode }> = {
  bookmarks: { title: "Bookmarks", node: () => <BookmarksPanel /> },
  notes: { title: "Notes", node: () => <NotesPanel /> },
  tasks: { title: "Tasks", node: () => <TasksPanel /> },
  music: { title: "Music", node: () => <MusicPanel /> },
  news: { title: "News", node: () => <NewsPanel /> },
  history: { title: "Recently visited", node: () => <HistoryPanel /> },
  appearance: {
    title: "Appearance",
    node: () => <AppearancePanel withWidgets />,
  },
};
interface Props {
  templateId?: string;
  preview?: boolean;
  onExitPreview?: () => void;
  onApply?: () => void;
}
export default function Dashboard({
  templateId,
  preview,
  onExitPreview,
  onApply,
}: Props) {
  const { data } = useStore();
  const a = data.appearance;
  const tpl = getTemplate(templateId ?? data.templateId, data.customTemplates);
  const L = look(tpl, a);
  const [drawer, setDrawer] = useState<DrawerKey | null>(null);
  const [gallery, setGallery] = useState(false);
  const [settings, setSettings] = useState<Tab | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const w = data.widgets;
  const tools: {
    key: string;
    label: string;
    icon: typeof Search;
    run: () => void;
  }[] = [
    {
      key: "s",
      label: "Search",
      icon: Search,
      run: () => {
        setDrawer(null);
        searchRef.current?.focus();
      },
    },
    {
      key: "bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      run: () => setDrawer("bookmarks"),
    },
    {
      key: "tools",
      label: "Extensions",
      icon: Puzzle,
      run: () =>
        inExt()
          ? void chrome.tabs.create({ url: "chrome://extensions" })
          : alert("Opens chrome://extensions when installed as an extension."),
    },
    {
      key: "notes",
      label: "Notes",
      icon: StickyNote,
      run: () => setDrawer("notes"),
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: ListChecks,
      run: () => setDrawer("tasks"),
    },
    {
      key: "music",
      label: "Music",
      icon: Music2,
      run: () => setDrawer("music"),
    },
    {
      key: "news",
      label: "News",
      icon: Newspaper,
      run: () => setDrawer("news"),
    },
    {
      key: "history",
      label: "History",
      icon: History,
      run: () => setDrawer("history"),
    },
    {
      key: "templates",
      label: "Templates",
      icon: LayoutTemplate,
      run: () => setGallery(true),
    },
    {
      key: "appearance",
      label: "Appearance",
      icon: Palette,
      run: () => setDrawer("appearance"),
    },
    {
      key: "settings",
      label: "Settings",
      icon: Cog,
      run: () => setSettings("General"),
    },
  ];
  const align = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[a.clockPos];
  const clock = (w.clock || w.weather) && (
    <div className={`flex w-full flex-col gap-3 ${align}`}>
      {w.clock && <Clock size={tpl.layout === "classic" ? "sm" : "lg"} />}
      {w.weather && <Weather onSetup={() => setSettings("General")} />}
    </div>
  );
  const search = w.search && (
    <div className="mx-auto w-full max-w-2xl">
      <SearchBar
        inputRef={searchRef}
        tpl={tpl}
        onCustom={() => setSettings("Search")}
      />
    </div>
  );
  const D = drawer ? DRAWERS[drawer] : null;
  return (
    <div style={L.style} className="relative min-h-screen overflow-x-clip">
      <TemplateBackground
        templateId={tpl.id}
        bgMode={a.bgMode}
        background={L.bg}
        className="fixed inset-0 z-0"
        style={{
          filter: `blur(${a.blur}px) brightness(${a.brightness}%)`,
          transform: a.blur ? "scale(1.06)" : undefined,
        }}
      />
      <div
        className={`relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-7 pt-5 sm:px-10 ${preview ? "" : "lg:pr-24"}`}
      >
        <Nav tpl={tpl} />
        <main
          className={`flex flex-col gap-10 ${a.searchPos === "top" ? "pt-2" : "pt-[7vh]"}`}
        >
          {tpl.layout === "split" ? (
            <div className="grid items-center gap-8 lg:grid-cols-2">
              {clock}
              {search}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {tpl.layout === "classic" ? (
                <>
                  {clock}
                  {search}
                </>
              ) : (
                <>
                  {clock}
                  {search}
                </>
              )}
            </div>
          )}
          {w.shortcuts && (
            <Shortcuts tpl={tpl} cols={a.columns ?? tpl.columns} />
          )}
        </main>
      </div>
      {preview ? (
        <div className="fixed left-1/2 top-4 z-[75] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#15171d] py-2 pl-5 pr-2 text-sm text-white shadow-2xl">
          <span>
            Previewing <b>{tpl.name}</b>
          </span>
          <button
            className="rounded-full bg-white/10 px-4 py-1.5 hover:bg-white/20"
            onClick={onExitPreview}
          >
            Exit
          </button>
          <button
            className="rounded-full bg-[var(--accent)] px-4 py-1.5 font-medium"
            onClick={onApply}
          >
            Apply Template
          </button>
        </div>
      ) : (
        <>
          <div
            className="card fixed right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-0.5 p-1.5"
            role="toolbar"
            aria-label="Tools"
            style={{ borderRadius: "min(var(--radius),24px)" }}
          >
            {tools.map((t) => (
              <button
                key={t.key}
                onClick={t.run}
                aria-label={t.label}
                className={`group relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-[var(--hover)] ${drawer === t.key ? "bg-[var(--hover)] text-[var(--accent)]" : ""}`}
              >
                <t.icon size={18} />
                <span className="pointer-events-none absolute right-12 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
          {D && (
            <aside
              className="card-solid fixed bottom-4 right-20 top-4 z-40 flex w-[380px] max-w-[calc(100vw-6rem)] flex-col animate-slide"
              aria-label={D.title}
            >
              <div className="flex items-center justify-between px-5 pb-2 pt-4">
                <h3 className="font-semibold">{D.title}</h3>
                <button
                  className="icon-btn"
                  aria-label="Close panel"
                  onClick={() => setDrawer(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
                {D.node()}
              </div>
            </aside>
          )}
          {gallery && (
            <Gallery
              onClose={() => setGallery(false)}
              onApplied={() => setGallery(false)}
            />
          )}
          {settings && (
            <Settings
              tab={settings}
              onClose={() => setSettings(null)}
              openGallery={() => setGallery(true)}
            />
          )}
        </>
      )}
    </div>
  );
}
