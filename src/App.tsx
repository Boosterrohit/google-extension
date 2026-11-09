import { Component, ReactNode, useEffect } from 'react';
import { useStore } from './store';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
class Boundary extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    return this.state.err ? <div className="grid min-h-screen place-items-center bg-[#0d0f16] p-6 text-center text-white"><div><p className="text-lg font-semibold">Something went wrong</p><p className="mt-1 text-sm opacity-70">Reload the tab. If it keeps happening, your data is still saved.</p><button className="btn-primary mt-4" onClick={() => location.reload()}>Reload</button></div></div> : this.props.children;
  }
}
export default function App() {
  const { ready, data, init } = useStore();
  useEffect(() => { void init(); }, [init]);
  if (!ready) return <div className="min-h-screen bg-[#0d0f16]" />;
  return <Boundary>{data.onboarded ? <Dashboard /> : <Onboarding />}</Boundary>;
}
