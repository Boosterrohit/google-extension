import { RefObject, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  Clock,
  History as Hist,
  Globe,
} from "lucide-react";
import { useStore } from "../store";
import { ENGINES } from "../defaults";
import { Data, Template } from "../types";
import { inExt } from "../storage";
export const searchUrl = (d: Data, q: string) => {
  const e = ENGINES.find((x) => x.id === d.engine) ?? ENGINES[0];
  const tpl = e.id === "custom" ? d.customEngineUrl : e.url;
  return (tpl.includes("%s") ? tpl : ENGINES[0].url).replace(
    "%s",
    encodeURIComponent(q),
  );
};
interface Sug {
  label: string;
  sub?: string;
  kind: "recent" | "history" | "site";
  go: string | { q: string };
}
export function SearchBar({
  inputRef,
  tpl,
  onCustom,
}: {
  inputRef: RefObject<HTMLInputElement>;
  tpl: Template;
  onCustom: () => void;
}) {
  const { data, patch, flush } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [eng, setEng] = useState(false);
  const [sel, setSel] = useState(-1);
  const [hist, setHist] = useState<Sug[]>([]);
  useEffect(() => {
    if (!q.trim() || !inExt()) {
      setHist([]);
      return;
    }
    let dead = false;
    chrome.history
      .search({ text: q, maxResults: 4 })
      .then((r) => {
        if (!dead)
          setHist(
            r
              .filter((x) => x.url)
              .map((x) => ({
                label: x.title || x.url!,
                sub: x.url,
                kind: "history",
                go: x.url!,
              })),
          );
      })
      .catch(() => setHist([]));
    return () => {
      dead = true;
    };
  }, [q]);
  const sugs = useMemo<Sug[]>(() => {
    const t = q.trim().toLowerCase();
    const recent: Sug[] = data.recent
      .filter((r) => !t || r.toLowerCase().includes(t))
      .slice(0, 4)
      .map((r) => ({ label: r, kind: "recent", go: { q: r } }));
    const sites: Sug[] = t
      ? Object.values(data.panels)
          .flat()
          .flatMap((p) => p.items)
          .filter((i) => i.title.toLowerCase().includes(t))
          .slice(0, 3)
          .map((i) => ({ label: i.title, sub: i.url, kind: "site", go: i.url }))
      : [];
    const seen = new Set<string>();
    return [...sites, ...hist, ...recent]
      .filter((s) => !seen.has(s.label) && seen.add(s.label))
      .slice(0, 8);
  }, [q, data.recent, data.panels, hist]);
  const nav = async (url: string) => {
    await flush();
    window.location.href = url;
  };
  const run = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    if (data.engine === "custom" && !data.customEngineUrl.includes("%s")) {
      onCustom();
      return;
    }
    patch({ recent: [t, ...data.recent.filter((r) => r !== t)].slice(0, 20) });
    const isUrl =
      /^https?:\/\/\S+$/i.test(t) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(t);
    await nav(
      isUrl
        ? /^https?:/i.test(t)
          ? t
          : `https://${t}`
        : searchUrl(useStore.getState().data, t),
    );
  };
  const pick = (s: Sug) =>
    typeof s.go === "string" ? void nav(s.go) : void run(s.go.q);
  const current = ENGINES.find((e) => e.id === data.engine) ?? ENGINES[0];
  const shape =
    tpl.search === "pill" ? "rounded-full" : "rounded-[var(--radius)]";
  return (
    <div className={`relative w-full ${eng || (open && sugs.length > 0) ? "z-50" : ""}`}>
      <div
        className={`card flex items-center gap-1 px-2 py-1.5 ${shape}`}
        style={{ boxShadow: "var(--shadow)" }}
      >
        <div className="relative">
          <button
            className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium hover:bg-[var(--hover)]"
            onClick={() => setEng(!eng)}
            aria-haspopup="listbox"
            aria-expanded={eng}
          >
            {current.name}
            <ChevronDown size={14} />
          </button>
          {eng && (
            <div
              className="card-solid z-30 absolute left-0 top-full mt-2 w-44 p-1.5 animate-fade"
              role="listbox"
            >
              {ENGINES.map((e) => (
                <button
                  key={e.id}
                  role="option"
                  aria-selected={e.id === data.engine}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--hover)] ${e.id === data.engine ? "font-medium text-[var(--accent)]" : ""}`}
                  onClick={() => {
                    patch({ engine: e.id });
                    setEng(false);
                    if (e.id === "custom" && !data.customEngineUrl) onCustom();
                    inputRef.current?.focus();
                  }}
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel(Math.min(sel + 1, sugs.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel(Math.max(sel - 1, -1));
            } else if (e.key === "Enter") {
              sel >= 0 && sugs[sel] ? pick(sugs[sel]) : void run(q);
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={`Search ${current.name} or type a URL`}
          aria-label="Search"
          className="min-w-0 flex-1 mr-1 rounded-full bg-transparent px-2 py-2 text-base outline-none placeholder:text-[var(--muted)]"
          style={{ color: "var(--fg)" }}
        />
        {q && (
          <button
            className="icon-btn"
            aria-label="Clear search"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
        <button
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent)] text-white transition hover:brightness-110"
          aria-label="Search"
          onClick={() => void run(q)}
        >
          <Search size={16} />
        </button>
      </div>
      {open && sugs.length > 0 && (
        <div className="card-solid absolute top-full left-0 right-0 z-20 mt-2 p-1.5 animate-fade">
          {sugs.map((s, i) => {
            const I =
              s.kind === "recent" ? Clock : s.kind === "history" ? Hist : Globe;
            return (
              <button
                key={s.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${i === sel ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"}`}
              >
                <I size={15} className="muted shrink-0" />
                <span className="truncate">{s.label}</span>
                {s.sub && (
                  <span className="muted ml-auto max-w-[40%] truncate text-xs">
                    {s.sub}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
