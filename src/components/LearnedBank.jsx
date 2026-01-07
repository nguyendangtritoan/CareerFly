import React from 'react';
import { useStats } from '../hooks/useStats';
import { cn } from '../lib/utils';
import { Cloud } from 'lucide-react';

export default function LearnedBank({ className }) {
    const { stats, isLoading } = useStats();

    // Convert dictionary to array for mapping
    const tags = React.useMemo(() => {
        if (!stats?.tagCounts) return [];
        return Object.entries(stats.tagCounts).map(([label, count]) => ({
            id: label,
            label,
            usageCount: count
        })).sort((a, b) => b.usageCount - a.usageCount);
    }, [stats]);

    // Helper to normalize font size between 0.75rem and 1.5rem
    const getFontSize = (count, max) => {
        if (max === 0) return 'text-xs';
        const minSize = 0.75; // rem
        const maxSize = 1.5; // rem
        const normalized = Math.min(1, Math.max(0, count / max));
        const size = minSize + normalized * (maxSize - minSize);
        return `${size}rem`;
    };

    const maxCount = tags?.length > 0 ? Math.max(...tags.map(t => t.usageCount || 0)) : 0;

    if (isLoading) return <div className="p-4 text-xs text-zinc-500">Loading skills...</div>;

    return (
        <div className={cn("p-6 rounded-card border border-border-subtle dark:border-zinc-800 bg-surface dark:bg-zinc-900", className)}>
            <h3 className="text-lg font-medium text-text-primary dark:text-zinc-50 mb-1 flex items-center gap-2">
                <Cloud size={18} className="text-text-primary dark:text-text-secondary" /> Learned Bank
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">Visualizing your growing skill set.</p>

            {!tags || tags.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-600 text-sm italic">
                    Use #hashtags in your logs to build your bank.
                </div>
            ) : (
                <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center">
                    {tags.map(tag => (
                        <span
                            key={tag.id}
                            className="font-mono transition-all duration-300 hover:text-indigo-600 dark:hover:text-text-secondary cursor-default text-zinc-700 dark:text-zinc-300"
                            style={{
                                fontSize: getFontSize(tag.usageCount, maxCount),
                                opacity: 0.6 + (tag.usageCount / maxCount) * 0.4
                            }}
                        >
                            #{tag.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
