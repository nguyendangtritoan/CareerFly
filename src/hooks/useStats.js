import { useMemo } from 'react';
import { useLogs } from './useLogs';
import { useStore } from '../lib/store';

export function useStats() {
    const { logs, isLoading: isLoadingLogs } = useLogs();
    const { isManagerMode } = useStore();

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        if (!isManagerMode) return logs;

        // Manager Mode Filters
        return logs.filter(log => {
            // Hide private tags
            if (log.tags?.some(tag => tag.toLowerCase() === 'private' || tag.toLowerCase() === 'venting')) return false;
            return true;
        });
    }, [logs, isManagerMode]);

    const stats = useMemo(() => {
        if (!filteredLogs) return { topSkills: [], impact: { high: 0, med: 0, low: 0 }, total: 0 };

        const skillCounts = {};
        const perfCategoryCounts = {};
        let impactHigh = 0;
        let impactMed = 0;
        let impactLow = 0;

        filteredLogs.forEach(log => {
            // Tags
            log.tags?.forEach(tag => {
                skillCounts[tag] = (skillCounts[tag] || 0) + 1;
            });

            // Performance Categories (@Category)
            log.metadata?.performanceCategories?.forEach(cat => {
                perfCategoryCounts[cat] = (perfCategoryCounts[cat] || 0) + 1;
            });

            // Impact
            const imp = log.metadata?.impact || 'medium';
            if (imp === 'high') impactHigh++;
            else if (imp === 'medium') impactMed++;
            else impactLow++;
        });

        const topSkills = Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const total = filteredLogs.length || 1; // avoid division by zero

        return {
            topSkills,
            tagCounts: skillCounts, // Full list for LearnedBank
            performanceCategories: perfCategoryCounts, // Return raw counts
            impact: {
                high: impactHigh / total,
                med: impactMed / total,
                low: impactLow / total
            },
            total: filteredLogs.length
        };
    }, [filteredLogs]);

    return {
        stats,
        isLoading: isLoadingLogs,
        filteredLogs // Exporting this in case UI needs the raw filtered list
    };
}
