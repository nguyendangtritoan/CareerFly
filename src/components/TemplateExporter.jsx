import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { useLogs } from '../hooks/useLogs';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { tiptapToPlainText } from '../lib/tiptapToText';

const TEMPLATES = [
    {
        id: 'performance-review',
        label: 'Standard Performance Review',
        description: 'Grouped by Ticket/Project, suitable for Workday.',
        pattern: (log) => `• ${log.date}: ${log.plainText} ${log.ticketString ? `(${log.ticketString})` : ''}`
    },
    {
        id: 'daily-standup',
        label: 'Daily Standup / Asynch',
        description: 'Simple bullet points of yesterday\'s work.',
        pattern: (log) => `- ${log.plainText}`
    },
    {
        id: 'markdown-changelog',
        label: 'Markdown Changelog',
        description: 'Formatted for GitHub/GitLab descriptions.',
        pattern: (log) => `* **${log.date}**: ${log.plainText}`
    }
];

export default function TemplateExporter({ className }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('performance-review');
    const [copied, setCopied] = useState(false);

    // Fetch last 30 days by default for export if no range specified
    const { logs } = useLogs();

    const generateExport = () => {
        if (!logs) return '';

        const template = TEMPLATES.find(t => t.id === selectedTemplate);
        if (!template) return '';

        // Advanced Grouping Logic could go here. For MVP, we list chronologically.
        // Spec mentions "Group by Project Tag". 
        // Let's do a simple grouping if the template is 'performance-review'

        if (selectedTemplate === 'performance-review') {
            const groups = {};
            logs.forEach(log => {
                // Find primary "Project" or "Ticket"
                let key = 'General / Misc';
                if (log.externalTickets && log.externalTickets.length > 0) {
                    // We only have IDs, and would need to fetch ticket keys. 
                    // For now, let's rely on extracting from text or just 'General'
                    // Wait, we don't have ticketKeys loaded in logs automatically.
                    // We can use the first tag as a project proxy?
                }
                if (log.tags && log.tags.length > 0) {
                    key = `#${log.tags[0]}`; // Naive primary tag
                }

                if (!groups[key]) groups[key] = [];
                groups[key].push(log);
            });

            return Object.entries(groups).map(([group, groupLogs]) => {
                const lines = groupLogs.map(log => {
                    const date = format(new Date(log.dateIso), 'MMM d');
                    const plainText = log.content?.body ? tiptapToPlainText(log.content.body) : 'No content';
                    // Ticket extraction naive
                    const ticketMatch = plainText.match(/[A-Z]+-\d+/);
                    const ticketString = ticketMatch ? ticketMatch[0] : null;

                    return template.pattern({ date, plainText, ticketString });
                }).join('\n');
                return `### ${group}\n${lines}`;
            }).join('\n\n');
        }

        // Default Linear List
        return logs.map(log => {
            const date = format(new Date(log.dateIso), 'yyyy-MM-dd');
            const plainText = log.content?.body ? tiptapToPlainText(log.content.body) : 'No content';
            return template.pattern({ date, plainText });
        }).join('\n');
    };

    const content = React.useMemo(() => generateExport(), [logs, selectedTemplate]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600 dark:text-indigo-400" /> Export Review
                </h3>
                <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-300 focus:outline-none"
                >
                    {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
            </div>

            <div className="relative">
                <textarea
                    readOnly
                    value={content}
                    className="w-full h-40 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-700 dark:text-zinc-400 resize-none focus:outline-none"
                />
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md transition-colors"
                    title="Copy to Clipboard"
                >
                    {copied ? <Check size={14} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    )
}
