/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { TableEditor } from './components/TableEditor';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SheetFlow</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Firebase Authenticated</span>
          </div>
          {!loading && <Auth user={user} />}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:flex flex-col shrink-0">
          <div className="space-y-1 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Main</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
              <span>Data Table</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">
              <span>History</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">
              <span>Templates</span>
            </button>
          </div>
          
          <div className="space-y-1 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Integrations</p>
            <button className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">
              <span>Google Drive</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_4px_rgba(59,130,246,0.5)]"></div>
            </button>
          </div>

          <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">Paste your Excel or Sheets data anywhere on the screen to start formatting.</p>
          </div>
        </aside>

        <section className="flex-1 flex flex-col p-4 sm:p-8 overflow-hidden">
          <TableEditor user={user} />
        </section>
      </main>
    </div>
  );
}
