import React, { useMemo } from 'react';
import { useLogs, useAddLog, useDeleteLog } from '../hooks/useLogs';
import Composer from '../components/Composer';
import LogEntry from '../components/LogEntry';
import { db } from '../lib/db';
import { CloudOff, Filter, X, Star } from 'lucide-react';
import { DatePicker } from '../components/ui/DatePicker'
import { ConfirmDialog } from '../components/ui/Dialog'
import { getWeekNumber, cn } from '../lib/utils';

export default function Timeline() {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
    const [filterStarred, setFilterStarred] = React.useState(false);
    const [dateRange, setDateRange] = React.useState(() => {
        return { start: '', end: '' };
    });

    // Derived state for DatePicker
    const startDate = dateRange.start;
    const endDate = dateRange.end;

    // Handlers
    const setStartDate = (date) => setDateRange(prev => ({ ...prev, start: date }));
    const setEndDate = (date) => setDateRange(prev => ({ ...prev, end: date }));

    const { logs, isLoading } = useLogs({
        startDate: dateRange.start ? dateRange.start : undefined,
        endDate: dateRange.end ? dateRange.end : undefined
    });
    const addLog = useAddLog();

    const handleSave = (json, text, impact, date) => {
        addLog.mutate({ json, text, impact, date });
    };

    const deleteLog = useDeleteLog();
    const [logToDelete, setLogToDelete] = React.useState(null);

    const handleDelete = (id) => {
        setLogToDelete(id);
    }

    const confirmDelete = () => {
        if (logToDelete) {
            deleteLog.mutate(logToDelete);
            setLogToDelete(null);
        }
    }

    // Filter logs logic
    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        let result = logs;

        if (filterStarred) {
            result = result.filter(log => log.metadata?.isStarred);
        }

        return result;
    }, [logs, filterStarred]);

    // Invert logs for Chat-style (Oldest -> Newest)
    const sortedLogs = useMemo(() => {
        if (!filteredLogs) return [];
        return [...filteredLogs].reverse(); // logs are Descending from DB, so reverse makes them Ascending
    }, [filteredLogs]);

    // Group logs
    const groupedLogs = useMemo(() => {
        if (!sortedLogs.length) return {};
        const groups = {};
        sortedLogs.forEach(log => {
            if (!log.dateIso) return;
            const d = new Date(log.dateIso);
            if (isNaN(d.getTime())) return;

            const year = d.getFullYear();
            const week = getWeekNumber(d);
            const key = `Week ${week} • ${year}`;

            if (!groups[key]) groups[key] = [];
            groups[key].push(log);
        });
        return groups;
    }, [sortedLogs]);

    // Auto-scroll to bottom
    const bottomRef = React.useRef(null);
    React.useEffect(() => {
        if (bottomRef.current && !isLoading) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [filteredLogs, isLoading]);

    return (
        <div className="relative h-full w-full bg-[#efefe8] dark:bg-zinc-950 overflow-hidden notebook-grid">

            {/* Filter Toggle */}
            <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className={cn(
                    "absolute top-6 right-6 z-40 p-2 bg-surface dark:bg-zinc-900/80 backdrop-blur-md border border-border-input dark:border-zinc-800 rounded-full text-text-secondary dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors shadow-lg",
                    isMobileFiltersOpen && "bg-tag-bg dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200"
                )}
            >
                {isMobileFiltersOpen ? <X size={16} /> : <Filter size={16} />}
            </button>

            {/* Floating Filters (Compact) */}
            <div className={cn(
                "absolute top-16 right-4 md:top-4 md:right-16 z-30 flex-col gap-2 p-3 bg-surface dark:bg-zinc-900/90 backdrop-blur-md rounded-card border border-border-subtle dark:border-zinc-800/50 shadow-2xl w-64 transition-all hover:bg-gray-50 dark:hover:bg-zinc-900/60 group animate-in fade-in slide-in-from-top-2",
                isMobileFiltersOpen ? "flex" : "hidden"
            )}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">Filters</span>

                    {/* Star Filter Toggle */}
                    <button
                        onClick={() => setFilterStarred(!filterStarred)}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border",
                            filterStarred
                                ? "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400"
                                : "bg-white border-zinc-200 text-zinc-500 hover:text-amber-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                        )}
                    >
                        <Star size={10} fill={filterStarred ? "currentColor" : "none"} />
                        <span>Starred Only</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setDateRange({ start: '', end: '' })}
                        className={cn(
                            "px-2 py-1.5 text-[10px] font-medium rounded-md border transition-all",
                            !startDate && !endDate
                                ? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-action-primary/20 dark:border-indigo-500/30 dark:text-indigo-300"
                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => {
                            const now = new Date();
                            const start = new Date(now);
                            const day = start.getDay();
                            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
                            start.setDate(diff);
                            start.setHours(0, 0, 0, 0);
                            setDateRange({ start: start.toISOString(), end: now.toISOString() });
                        }}
                        className={cn(
                            "px-2 py-1.5 text-[10px] font-medium rounded-md border transition-all",
                            startDate && endDate
                                ? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-action-primary/20 dark:border-indigo-500/30 dark:text-indigo-300"
                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        This Week
                    </button>
                </div>

                <div className="space-y-1.5">
                    <DatePicker
                        date={startDate ? new Date(startDate) : undefined}
                        onSelect={(d) => setStartDate(d?.toISOString())}
                        placeholder="Start"
                        className="w-full"
                        buttonClassName="w-full justify-between bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-800/30 dark:border-zinc-700/50 dark:text-zinc-400 text-[10px] h-7 px-2"
                    />
                    <DatePicker
                        date={endDate ? new Date(endDate) : undefined}
                        onSelect={(d) => setEndDate(d?.toISOString())}
                        placeholder="End"
                        className="w-full"
                        buttonClassName="w-full justify-between bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-800/30 dark:border-zinc-700/50 dark:text-zinc-400 text-[10px] h-7 px-2"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="h-full flex flex-col min-w-0 bg-[#efefe8] dark:bg-zinc-950 relative notebook-grid">

                {/* Log List (Chat Style) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 md:px-8 space-y-8 flex flex-col scroll-smooth">



                    {isLoading ? (
                        <div className="m-auto text-zinc-500">Loading history...</div>
                    ) : !logs || logs.length === 0 ? (
                        <div className="m-auto text-center opacity-50">
                            <CloudOff size={48} className="mx-auto mb-4 text-zinc-600" />
                            <h3 className="text-lg font-medium text-zinc-400">No logs yet</h3>
                            <p className="text-sm text-zinc-600">Start the conversation below!</p>
                        </div>
                    ) : (
                        Object.entries(groupedLogs).map(([group, groupLogs]) => (
                            <div key={group} className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-center gap-4 md:gap-8 relative">
                                {/* Left: Sticky Week Indicator (Desktop) */}
                                <div className="hidden md:block w-24 shrink-0 text-right sticky top-4 self-start pt-2 z-10">
                                    <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest leading-none">{group.split(' • ')[0]}</h3>
                                    <span className="text-[10px] text-zinc-700 font-mono">{group.split(' • ')[1]}</span>
                                </div>

                                {/* Right: Timeline Content */}
                                <div className="w-full max-w-2xl space-y-6 relative pb-8">
                                    {/* Mobile Group Label */}
                                    <div className="md:hidden mb-4 flex items-center gap-4">
                                        <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">{group}</h3>
                                        <div className="h-px flex-1 bg-zinc-900"></div>
                                    </div>

                                    {groupLogs.map(log => (
                                        <LogEntry key={log.id} log={log} onDelete={handleDelete} />
                                    ))}
                                </div>
                                {/* Spacer Col for Centering */}
                                <div className="hidden md:block w-24 shrink-0" />
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>

                {/* Composer (Bottom Fixed) */}
                <div className="hidden md:block p-4 md:p-6 border-t-2 border-dashed border-zinc-400/60 dark:border-zinc-700/60 bg-[#efefe8] dark:bg-zinc-950/80 backdrop-blur-md z-20 notebook-grid">
                    <div className="max-w-2xl mx-auto">
                        <Composer onSave={handleSave} />
                    </div>
                </div>
            </main>

            <ConfirmDialog
                isOpen={!!logToDelete}
                onClose={() => setLogToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Log"
                description="Are you sure you want to delete this log entry? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    )
}
