import React, { useState } from 'react';
import { useLogs } from '../hooks/useLogs';
import { Sparkles, Copy, Check } from 'lucide-react';

export default function AIPromptGenerator({ className }) {
    const { logs } = useLogs();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const generatePrompt = () => {
        if (!logs || logs.length === 0) return "No logs available to generate summary.";

        const logText = logs.map(log => {
            const date = new Date(log.dateIso).toLocaleDateString();
            const content = log.content.plainTextSnippet || "No text content";
            const tags = log.tags?.join(", ") || "";
            const impact = log.metadata?.impact || "medium";
            return `[${date}] (Impact: ${impact}) (Tags: ${tags}): ${content}`;
        }).join("\n");

        return `I am a software engineer. Below is my work log for the recent period. 
Please summarize this into 3 categories: 
1. Technical Deliverables 
2. Problems Solved 
3. Knowledge Gained

My Logs:
${logText}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatePrompt());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) {
        return (
            <div
                onClick={() => setIsOpen(true)}
                className={`p-1 rounded-xl border border-zinc-800 border-dashed flex flex-col items-center justify-center py-8 text-zinc-500 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors cursor-pointer group ${className}`}
            >
                <div className="p-3 bg-zinc-800 rounded-full mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Sparkles size={20} />
                </div>
                <span className="text-sm font-medium">Generate AI Performance Summary</span>
                <span className="text-xs mt-1 text-zinc-600">Uses local template engine (Privacy Safe)</span>
            </div>
        );
    }

    return (
        <div className={`p-6 rounded-xl border border-zinc-800 bg-zinc-900 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-50 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-400" /> AI Prompt Ready
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Close</button>
            </div>

            <textarea
                className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-indigo-500/50 resize-none mb-4"
                readOnly
                value={generatePrompt()}
            />

            <button
                onClick={handleCopy}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied to Clipboard!" : "Copy Prompt for ChatGPT/Claude"}
            </button>
        </div>
    );
}
