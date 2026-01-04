import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Goals from './pages/Goals';
import Knowledge from './pages/Knowledge';
import Settings from './pages/Settings'; // Added Settings import
import { useEffect } from 'react';
import { useStore } from './lib/store'; // Corrected path

const queryClient = new QueryClient();

function App() {
  const { isPrivacyBlurred, setPrivacyBlurred } = useStore();

  useEffect(() => {
    const handleBlur = () => setPrivacyBlurred(true);
    const handleFocus = () => setPrivacyBlurred(false);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    }
  }, [setPrivacyBlurred]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30 relative">
          {isPrivacyBlurred && <div className="fixed inset-0 z-[100] backdrop-blur-xl bg-black/50 flex items-center justify-center pointer-events-none transition-all duration-700"><div className="text-zinc-500 font-mono text-sm animate-pulse flex items-center gap-2"><span>🔒</span> Content Hidden</div></div>}

          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;