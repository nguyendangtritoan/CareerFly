import React, { useMemo } from 'react';
import { useLogs, useAddLog } from '../hooks/useLogs';
import Composer from '../components/Composer';
import LogEntry from '../components/LogEntry';
import { db } from '../lib/db';
import { CloudOff } from 'lucide-react';
import { DatePicker } from '../components/ui/DatePicker'
import { getWeekNumber, cn } from '../lib/utils';

export default function Timeline() {
    const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
    const { logs, isLoading } = useLogs({
        startDate: dateRange.start ? dateRange.start : undefined,
        endDate: dateRange.end ? dateRange.end : undefined
    });
    const addLog = useAddLog();

    const handleSave = (json, text, impact) => {
        addLog.mutate({ json, text, impact });
    };

    const handleDelete = (id) => {
        if (confirm("Delete this log?")) {
            db.logs.delete(id);
        }
    }

    // Group logs
    const groupedLogs = useMemo(() => {
        if (!logs) return {};
        const groups = {};
        logs.forEach(log => {
            const d = new Date(log.dateIso);
            const year = d.getFullYear();
            const week = getWeekNumber(d);
            const key = `Week ${week} • ${year}`;

            if (!groups[key]) groups[key] = [];
            groups[key].push(log);
        });
        return groups;
    }, [logs]);

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto w-full pb-32">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Daily Log</h1>
                    <p className="text-zinc-400">Capture your work, blockers, and wins.</p>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-2">
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", filter === 'all' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('week')}
                            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", filter === 'week' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setFilter('custom')}
                            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", filter === 'custom' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
                        >
                            Custom
                        </button>
                    </div>

                    {filter === 'custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <DatePicker date={startDate ? new Date(startDate) : undefined} onSelect={(d) => setStartDate(d?.toISOString())} placeholder="Start Date" />
                            <span className="text-zinc-600">-</span>
                            <DatePicker date={endDate ? new Date(endDate) : undefined} onSelect={(d) => setEndDate(d?.toISOString())} placeholder="End Date" />
                        </div>
                    )}
                </div>
            </div>

            <Composer onSave={handleSave} className="mb-12" />

            <div className="space-y-10">
                {isLoading ? (
                    <div>Loading...</div>
                ) : !logs || logs.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <CloudOff size={48} className="mx-auto mb-4 text-zinc-600" />
                        <h3 className="text-lg font-medium text-zinc-400">No logs found</h3>
                        <p className="text-sm text-zinc-600">Start by typing what you worked on above!</p>
                    </div>
                ) : (
                    Object.entries(groupedLogs).map(([group, groupLogs]) => (
                        <div key={group}>
                            <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur py-3 border-b border-zinc-900/50 mb-6 flex items-center gap-4">
                                <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">{group}</h3>
                                <div className="h-px flex-1 bg-zinc-800"></div>
                            </div>
                            <div className="space-y-2">
                                {groupLogs.map(log => (
                                    <LogEntry key={log.id} log={log} onDelete={handleDelete} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
