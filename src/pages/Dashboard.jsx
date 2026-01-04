import React, { useMemo } from 'react';
import { Sparkles, Presentation, Eye, EyeOff } from 'lucide-react';
import AIPromptGenerator from '../components/AIPromptGenerator';
import LearnedBank from '../components/LearnedBank';
import TemplateExporter from '../components/TemplateExporter';
import Heatmap from '../components/Heatmap';
import FridayRitual from '../components/FridayRitual';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

import { useStats } from '../hooks/useStats';

export default function Dashboard() {
    const { stats, isLoading } = useStats();
    const { isManagerMode, toggleManagerMode } = useStore();

    // Use stats.total instead of filtering manually again just for count if needed, 
    // but filteredLogs is internal to the hook now unless we expose it.
    // The UI uses 'stats' object directly.

    if (isLoading) return <div className="p-8">Loading stats...</div>;

    return (
        <div className={cn("p-4 md:p-8 max-w-5xl mx-auto w-full pb-32 transition-colors duration-500", isManagerMode ? "bg-zinc-950" : "")}>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        Review & Growth
                        {isManagerMode && <span className="text-xs font-mono bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/50">MANAGER MODE</span>}
                    </h1>
                    <p className="text-zinc-400">Track your impact metrics and career progress.</p>
                </div>

                <button
                    onClick={toggleManagerMode}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                        isManagerMode
                            ? "bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500/20"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    )}
                >
                    {isManagerMode ? <Eye size={16} /> : <EyeOff size={16} />}
                    {isManagerMode ? "Exit Presentation View" : "Presentation View"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* 0. Heatmap (FR-09) */}
                <div className="md:col-span-3">
                    <Heatmap />
                </div>

                {/* 1. Impact Distribution */}
                <div className="md:col-span-2 p-6 rounded-xl border border-zinc-800 bg-zinc-900">
                    <h3 className="text-lg font-medium text-zinc-50 mb-1">Impact Distribution</h3>
                    <p className="text-sm text-zinc-500 mb-6">Visualizing your contribution intensity.</p>

                    <div className="space-y-6">
                        <div className="relative pt-2">
                            <div className="flex mb-2 items-center justify-between text-xs uppercase tracking-wider font-semibold text-zinc-400">
                                <span>Impact Breakdown</span>
                                <span className="text-zinc-50">{stats.total} Logs Total</span>
                            </div>
                            <div className="h-4 flex rounded-full overflow-hidden bg-zinc-800">
                                <div style={{ width: `${stats.impact.high * 100}%` }} className="bg-amber-500 transition-all duration-1000" title="High Impact"></div>
                                <div style={{ width: `${stats.impact.med * 100}%` }} className="bg-indigo-500 transition-all duration-1000" title="Medium Impact"></div>
                                <div style={{ width: `${stats.impact.low * 100}%` }} className="bg-zinc-600 transition-all duration-1000" title="Low Impact"></div>
                            </div>
                            <div className="flex gap-4 mt-3 text-xs">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> High</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Medium</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-zinc-600"></div> Low</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Top Skills & Learned Bank */}
                <div className="space-y-6">
                    <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
                        <h3 className="text-lg font-medium text-zinc-50 mb-4">Top Skills</h3>
                        <div className="space-y-3">
                            {stats.topSkills.length > 0 ? stats.topSkills.map(([skill, count], i) => (
                                <div key={skill} className="flex items-center justify-between group">
                                    <span className="text-sm text-zinc-300 flex items-center gap-2">
                                        <span className="text-zinc-600 font-mono text-xs">0{i + 1}</span>
                                        {skill}
                                    </span>
                                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{count}</span>
                                </div>
                            )) : (
                                <div className="text-zinc-500 text-sm italic">No skills tagged yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <LearnedBank className="mb-6" />
                    <TemplateExporter />
                </div>

                {/* 3. AI Generator */}
                <AIPromptGenerator className="md:col-span-3" />
            </div>
            {/* Friday Ritual (Floating) */}
            <FridayRitual />
        </div>
    )
}
