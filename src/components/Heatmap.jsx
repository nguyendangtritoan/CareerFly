import React, { useMemo } from 'react';
import { useLogs } from '../hooks/useLogs';
import { subDays, format, eachDayOfInterval, getDay, startOfYear } from 'date-fns';
import { cn } from '../lib/utils';
import { Activity } from 'lucide-react';

export default function Heatmap({ className }) {
    // Fetch extensive logs? 
    // Ideally useLogs should support a wider range for heatmap, or we fetch "all" for now.
    // For performance in MVP, fetching all from Dexie is "okay" up to ~5k logs.
    const { logs } = useLogs();

    const heatmapData = useMemo(() => {
        if (!logs) return {};

        // Aggregation: { '2025-01-01': count }
        const data = {};
        logs.forEach(log => {
            const dateKey = format(new Date(log.dateIso), 'yyyy-MM-dd');
            data[dateKey] = (data[dateKey] || 0) + 1;
        });
        return data;
    }, [logs]);

    // Generate last 365 days
    const today = new Date();
    const startDate = subDays(today, 364); // roughly 1 year

    const days = eachDayOfInterval({
        start: startDate,
        end: today
    });

    const getColor = (count) => {
        if (!count) return 'bg-gray-200 dark:bg-zinc-800/50';
        if (count === 1) return 'bg-indigo-200 dark:bg-indigo-900/60';
        if (count <= 3) return 'bg-indigo-400 dark:bg-indigo-700';
        return 'bg-indigo-600 dark:bg-indigo-500'; // High activity
    };

    return (
        <div className={cn("p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden", className)}>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500 dark:text-emerald-400" /> Contribution Activity
            </h3>

            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                {/* We need to render grid: 7 rows (days of week) x ~52 cols */}
                {/* CSS Grid is easiest? Or Flex cols? Flex cols is easier for horizontal scroll */}

                {/* We group days by Week for column rendering */}
                {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 shrink-0">
                        {days.slice(weekIndex * 7, (weekIndex * 7) + 7).map(day => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const count = heatmapData[dateKey] || 0;
                            return (
                                <div
                                    key={dateKey}
                                    title={`${dateKey}: ${count} logs`}
                                    className={cn(
                                        "w-3 h-3 rounded-sm transition-colors hover:ring-1 hover:ring-zinc-400 dark:hover:ring-white/50",
                                        getColor(count)
                                    )}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
            <div className="flex justify-end items-center gap-2 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-zinc-800/50"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-200 dark:bg-indigo-900/60"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-400 dark:bg-indigo-700"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-600 dark:bg-indigo-500"></div>
                <span>More</span>
            </div>
        </div>
    )
}
