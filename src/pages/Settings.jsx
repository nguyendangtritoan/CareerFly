import React from 'react';
import { useStore } from '../lib/store';
import { db } from '../lib/db';
import { Moon, Sun, Download, Trash2, Database } from 'lucide-react';
import { syncEngine } from '../lib/sync';

export default function Settings() {
    const { user, syncStatus, isDarkMode, toggleDarkMode } = useStore();


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
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Settings</h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">Manage your preferences and data.</p>
            </div>

            {/* Appearance */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Appearance</h2>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </div>
                        <div>
                            <p className="text-zinc-900 dark:text-zinc-200 text-sm font-medium">Dark Mode</p>
                            <p className="text-zinc-500 dark:text-zinc-500 text-xs">Manage theme preference</p>
                        </div>
                    </div>
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className={`w-10 h-6 rounded-full relative cursor-pointer transition-all flex-shrink-0 ${isDarkMode ? 'bg-indigo-600' : 'bg-zinc-700'
                            }`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'right-1' : 'left-1'
                            }`}></div>
                    </button>
                </div>
            </section>

            {/* Sync & Data */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Data & Sync</h2>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-zinc-800 rounded-lg text-amber-600 dark:text-amber-500">
                                <Database size={18} />
                            </div>
                            <div>
                                <p className="text-zinc-900 dark:text-zinc-200 text-sm font-medium">Sync Status</p>
                                <p className="text-zinc-500 dark:text-zinc-500 text-xs text-nowrap">
                                    {user ? `Logged in as ${user.email} (${syncStatus})` : 'Guest Mode (Local Only)'}
                                </p>
                            </div>
                        </div>
                        {user && syncStatus === 'error' && (
                            <button
                                onClick={() => syncEngine.retrySync()}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                Retry
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex w-full items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-left group"
                    >
                        <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 group-hover:bg-gray-200 dark:group-hover:bg-zinc-700">
                            <Download size={18} />
                        </div>
                        <div>
                            <p className="text-zinc-900 dark:text-zinc-200 text-sm font-medium">Export Data</p>
                            <p className="text-zinc-500 dark:text-zinc-500 text-xs">Download all logs as JSON</p>
                        </div>
                    </button>

                    <button
                        onClick={handleClearData}
                        className="flex w-full items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left group"
                    >
                        <div className="p-2 bg-red-100 dark:bg-zinc-800 rounded-lg text-red-500 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/20">
                            <Trash2 size={18} />
                        </div>
                        <div>
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">Delete All Data</p>
                            <p className="text-zinc-500 dark:text-zinc-500 text-xs">Irreversible local wipe</p>
                        </div>
                    </button>
                </div>
            </section>


            <div className="text-center pt-8">
                <p className="text-xs text-zinc-600">CareerFly v2.5</p>
            </div>
        </div>
    );
}
