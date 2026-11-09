import { useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  GripVertical,
  LayoutGrid,
} from "lucide-react";
import { useStore } from "../store";
import { PRESETS, uid } from "../defaults";
import { Panel, Shortcut, Template } from "../types";
import { Empty, Favicon, PromptModal } from "./ui";
type Drag =
  | { kind: "item"; pid: string; iid: string }
  | { kind: "panel"; pid: string }
  | null;
type Edit =
  | { kind: "item"; pid: string; item?: Shortcut }
  | { kind: "panel"; panel?: Panel }
  | null;
const normUrl = (u: string) =>
  /^[a-z]+:\/\//i.test(u.trim()) ? u.trim() : `https://${u.trim()}`;
export function Shortcuts({ tpl, cols }: { tpl: Template; cols: number }) {
  const { data, patch } = useStore();
  const drag = useRef<Drag>(null);
  const [edit, setEdit] = useState<Edit>(null);
  const panels = data.panels[data.activeNav] ?? [];
  const setPanels = (p: Panel[]) =>
    patch({ panels: { ...data.panels, [data.activeNav]: p } });
  const tiles = tpl.shortcuts === "tiles";
  const moveItem = (toPid: string, beforeId?: string) => {
    const d = drag.current;
    if (!d || d.kind !== "item") return;
    const moved = panels
      .find((p) => p.id === d.pid)
      ?.items.find((i) => i.id === d.iid);
    if (!moved) return;
    setPanels(
      panels.map((p) => {
        let items = p.items.filter((i) => i.id !== moved.id);
        if (p.id === toPid) {
          const idx = beforeId ? items.findIndex((i) => i.id === beforeId) : -1;
          if (idx < 0) items = [...items, moved];
          else items.splice(idx, 0, moved);
        }
        return { ...p, items };
      }),
    );
    drag.current = null;
  };
  const movePanel = (toId: string) => {
    const d = drag.current;
    if (!d || d.kind !== "panel" || d.pid === toId) return;
    const from = panels.find((p) => p.id === d.pid);
    if (!from) return;
    const rest = panels.filter((p) => p.id !== d.pid);
    rest.splice(
      rest.findIndex((p) => p.id === toId),
      0,
      from,
    );
    setPanels(rest);
    drag.current = null;
  };
  const del = (pid: string, iid: string) =>
    setPanels(
      panels.map((p) =>
        p.id === pid ? { ...p, items: p.items.filter((i) => i.id !== iid) } : p,
      ),
    );
  const item = (p: Panel, i: Shortcut) => (
    <div
      key={i.id}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        drag.current = { kind: "item", pid: p.id, iid: i.id };
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.stopPropagation();
        moveItem(p.id, i.id);
      }}
      className={`group relative ${tiles ? "flex w-[84px] flex-col items-center gap-2 rounded-2xl p-2 hover:bg-[var(--thover)]" : "flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--hover)]"}`}
    >
      <a
        href={i.url}
        className={
          tiles
            ? "flex flex-col items-center gap-2"
            : "flex min-w-0 flex-1 items-center gap-3"
        }
        draggable={false}
      >
        {tiles ? (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
            <Favicon url={i.url} icon={i.icon} size={26} />
          </span>
        ) : (
          <Favicon url={i.url} icon={i.icon} size={20} />
        )}
        <span
          className={`truncate ${tiles ? "w-full text-center text-xs" : "text-sm"}`}
        >
          {i.title}
        </span>
      </a>
      <span
        className={`absolute flex gap-0.5 opacity-0 transition group-hover:opacity-100 ${tiles ? "right-0 top-0" : "right-1 top-1/2 -translate-y-1/2"}`}
      >
        <button
          className="icon-btn !h-6 !w-6 bg-[var(--solid)] text-[var(--fg)] shadow"
          aria-label={`Edit ${i.title}`}
          onClick={() => setEdit({ kind: "item", pid: p.id, item: i })}
        >
          <Pencil size={12} />
        </button>
        <button
          className="icon-btn !h-6 !w-6 bg-[var(--solid)] text-[var(--fg)] shadow"
          aria-label={`Delete ${i.title}`}
          onClick={() => del(p.id, i.id)}
        >
          <X size={12} />
        </button>
      </span>
    </div>
  );
  const panel = (p: Panel) => {
    const head = (
      <div
        draggable
        onDragStart={() => {
          drag.current = { kind: "panel", pid: p.id };
        }}
        className="group/h flex cursor-grab items-center gap-1 px-1 pb-2 active:cursor-grabbing"
      >
        <GripVertical
          size={14}
          className="muted opacity-0 transition group-hover/h:opacity-100"
        />
        <h3
          className={`flex-1 truncate text-sm font-semibold ${tiles ? "" : ""}`}
          style={tiles ? { color: "var(--tmuted)" } : undefined}
        >
          {p.title}
        </h3>
        <span className="flex opacity-0 transition group-hover/h:opacity-100">
          <button
            className="icon-btn !h-6 !w-6"
            aria-label="Add website"
            onClick={() => setEdit({ kind: "item", pid: p.id })}
          >
            <Plus size={14} />
          </button>
          <button
            className="icon-btn !h-6 !w-6"
            aria-label="Rename panel"
            onClick={() => setEdit({ kind: "panel", panel: p })}
          >
            <Pencil size={13} />
          </button>
          <button
            className="icon-btn !h-6 !w-6"
            aria-label="Delete panel"
            onClick={() =>
              confirm(`Delete "${p.title}" and its shortcuts?`) &&
              setPanels(panels.filter((x) => x.id !== p.id))
            }
          >
            <Trash2 size={13} />
          </button>
        </span>
      </div>
    );
    const empty = (
      <button
        className="muted w-full rounded-lg py-6 text-center text-xs hover:bg-[var(--hover)]"
        onClick={() => setEdit({ kind: "item", pid: p.id })}
      >
        Add your first website
      </button>
    );
    return (
      <section
        key={p.id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (drag.current?.kind === "panel") movePanel(p.id);
          else moveItem(p.id);
        }}
        className={tiles ? "" : "card p-3"}
      >
        {head}
        {tiles ? (
          <div className="flex flex-wrap gap-1 ">
            {p.items.map((i) => item(p, i))}
            {!p.items.length && (
              <button
                className="text-xs"
                style={{ color: "var(--tmuted)" }}
                onClick={() => setEdit({ kind: "item", pid: p.id })}
              >
                Add your first website
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {p.items.map((i) => item(p, i))}
            {!p.items.length && empty}
          </div>
        )}
      </section>
    );
  };
  return (
    <>
      {panels.length === 0 ? (
        <div className="card mx-auto max-w-md">
          <Empty
            icon={<LayoutGrid size={28} />}
            title="No shortcut panels here yet"
            hint="Create a panel to group your favourite sites."
          />
          <div className="flex justify-center gap-2 pb-6">
            <button
              className="btn-primary"
              onClick={() => setEdit({ kind: "panel" })}
            >
              Add panel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="pgrid"
          style={{ ["--cols" as string]: tiles ? Math.min(cols, 3) : cols }}
        >
          {panels.map(panel)}
          <button
            onClick={() => setEdit({ kind: "panel" })}
            className="flex min-h-[72px] items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed text-sm transition hover:bg-[var(--thover)]"
            style={{ borderColor: "var(--tmuted)", color: "var(--tmuted)" }}
          >
            <Plus size={16} />
            Add panel
          </button>
        </div>
      )}
      {edit?.kind === "item" && (
        <PromptModal
          title={edit.item ? "Edit website" : "Add website"}
          onClose={() => setEdit(null)}
          fields={[
            { key: "title", label: "Name", value: edit.item?.title },
            {
              key: "url",
              label: "Address",
              value: edit.item?.url,
              placeholder: "example.com",
            },
            {
              key: "icon",
              label: "Custom icon (emoji or image URL, optional)",
              value: edit.item?.icon,
            },
          ]}
          onSubmit={(v) => {
            if (!v.url.trim()) return;
            const url = normUrl(v.url);
            const base = {
              title: v.title.trim() || new URL(url).hostname,
              url,
              icon: v.icon.trim() || undefined,
            };
            setPanels(
              panels.map((p) =>
                p.id !== edit.pid
                  ? p
                  : {
                      ...p,
                      items: edit.item
                        ? p.items.map((i) =>
                            i.id === edit.item!.id ? { ...i, ...base } : i,
                          )
                        : [...p.items, { id: uid(), ...base }],
                    },
              ),
            );
            setEdit(null);
          }}
        />
      )}
      {edit?.kind === "panel" && (
        <PromptModal
          title={edit.panel ? "Rename panel" : "New panel"}
          onClose={() => setEdit(null)}
          fields={[
            { key: "title", label: "Panel name", value: edit.panel?.title },
          ]}
          onSubmit={(v) => {
            const t = v.title.trim();
            if (!t) return;
            setPanels(
              edit.panel
                ? panels.map((p) =>
                    p.id === edit.panel!.id ? { ...p, title: t } : p,
                  )
                : [
                    ...panels,
                    PRESETS[t]?.() ?? { id: uid(), title: t, items: [] },
                  ],
            );
            setEdit(null);
          }}
        />
      )}
    </>
  );
}
