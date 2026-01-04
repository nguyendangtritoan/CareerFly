import React from 'react';
import { useStore } from '../lib/store';
import { db } from '../lib/db';
import { Moon, Sun, Download, Trash2, Database, Shield } from 'lucide-react';
import { syncEngine } from '../lib/sync';

export default function Settings() {
    const { user, syncStatus } = useStore();

    const handleExport = async () => {
        const logs = await db.logs.toArray();
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `careerfly-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleClearData = async () => {
        if (confirm('Are you sure? This will delete ALL local data. (Cloud data remains if synced)')) {
            await db.delete();
            window.location.reload();
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-zinc-100 mb-2">Settings</h1>
                <p className="text-zinc-400 text-sm">Manage your preferences and data.</p>
            </div>

            {/* Appearance */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Appearance</h2>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                            <Moon size={18} />
                        </div>
                        <div>
                            <p className="text-zinc-200 text-sm font-medium">Dark Mode</p>
                            <p className="text-zinc-500 text-xs">Manage theme preference</p>
                        </div>
                    </div>
                    {/* Toggle Switch Mockup */}
                    <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer opacity-90 hover:opacity-100">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                    </div>
                </div>
            </section>

            {/* Sync & Data */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Data & Sync</h2>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg text-amber-500">
                                <Database size={18} />
                            </div>
                            <div>
                                <p className="text-zinc-200 text-sm font-medium">Sync Status</p>
                                <p className="text-zinc-500 text-xs text-nowrap">
                                    {user ? `Logged in as ${user.email} (${syncStatus})` : 'Guest Mode (Local Only)'}
                                </p>
                            </div>
                        </div>
                        {user && syncStatus === 'error' && (
                            <button className="text-xs text-red-400 hover:text-red-300">Retry</button>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex w-full items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-left group"
                    >
                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700">
                            <Download size={18} />
                        </div>
                        <div>
                            <p className="text-zinc-200 text-sm font-medium">Export Data</p>
                            <p className="text-zinc-500 text-xs">Download all logs as JSON</p>
                        </div>
                    </button>

                    <button
                        onClick={handleClearData}
                        className="flex w-full items-center gap-3 p-2 hover:bg-red-900/10 rounded-lg transition-colors text-left group"
                    >
                        <div className="p-2 bg-zinc-800 rounded-lg text-red-400 group-hover:bg-red-900/20">
                            <Trash2 size={18} />
                        </div>
                        <div>
                            <p className="text-red-400 text-sm font-medium">Delete All Data</p>
                            <p className="text-zinc-500 text-xs">Irreversible local wipe</p>
                        </div>
                    </button>
                </div>
            </section>

            {/* Privacy */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Privacy</h2>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500">
                            <Shield size={18} />
                        </div>
                        <div>
                            <p className="text-zinc-200 text-sm font-medium">Privacy Blur</p>
                            <p className="text-zinc-500 text-xs">Blur screen when inactive</p>
                        </div>
                    </div>
                    <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer opacity-90 hover:opacity-100">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                    </div>
                </div>
            </section>

            <div className="text-center pt-8">
                <p className="text-xs text-zinc-600">CareerFly v2.5</p>
            </div>
        </div>
    );
}
