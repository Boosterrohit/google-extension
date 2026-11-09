import { create } from 'zustand';
import { load, save } from './storage';
import { Data } from './types';
import { defaultData } from './defaults';
interface S { data: Data; ready: boolean; init(): Promise<void>; patch(p: Partial<Data>): void; flush(): Promise<void> }
const KEY = 'nt-data';
export const useStore = create<S>((set, get) => ({
  data: defaultData(), ready: false,
  async init() {
    const d = await load<Partial<Data>>(KEY); const base = defaultData();
    set({ ready: true, data: { ...base, ...d, appearance: { ...base.appearance, ...d?.appearance }, widgets: { ...base.widgets, ...d?.widgets } } });
  },
  patch(p) { set({ data: { ...get().data, ...p } }); },
  flush: () => save(KEY, get().data),
}));
let timer: number;
useStore.subscribe(s => { if (!s.ready) return; clearTimeout(timer); timer = window.setTimeout(() => void save(KEY, s.data), 250); });
