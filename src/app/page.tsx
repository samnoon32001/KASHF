'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#117B78] to-[#0D9C88] text-white shadow-xl font-black text-2xl tracking-wider">
          K
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800">Kashf Institute of Islamic Excellence</h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Initializing institutional portal...</p>
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return <App />;
}
