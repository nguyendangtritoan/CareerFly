import React from 'react';
import LearnedBank from '../components/LearnedBank';

export default function Knowledge() {
    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Knowledge Bank</h1>
                <p className="text-text-secondary dark:text-zinc-400 text-sm">Your accumulated skills and learnings over time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-transparent border-0 rounded-card p-1 md:col-span-2">
                    <LearnedBank />
                </div>

                {/* Future: Bookmarked Logs, Resources, etc. */}
                <div className="border border-dashed border-border-input dark:border-zinc-800 rounded-card p-8 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                    Bookmarks feature coming soon...
                </div>
                <div className="border border-dashed border-border-input dark:border-zinc-800 rounded-card p-8 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                    Learning Resources feature coming soon...
                </div>
            </div>
        </div>
    );
}
