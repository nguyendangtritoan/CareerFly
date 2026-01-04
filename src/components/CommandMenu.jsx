import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Target, Sun, Moon, Plus, FileText, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CommandMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <div className={cn("fixed inset-0 z-50 flex items-start justify-center pt-[20vh] transition-all duration-200", open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

            {/* Dialog */}
            <Command className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden font-sans">
                <div className="flex items-center border-b border-zinc-800 px-3">
                    <Command.Input
                        placeholder="Type a command or search..."
                        className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none text-zinc-100 placeholder:text-zinc-500"
                    />
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                    <Command.Empty className="py-6 text-center text-sm text-zinc-500">No results found.</Command.Empty>

                    <Command.Group heading="Navigation" className="mb-2 px-2 text-xs font-semibold text-zinc-500">
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/'))}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
                        >
                            <LayoutDashboard size={14} />
                            <span>Dashboard</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/timeline'))}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
                        >
                            <List size={14} />
                            <span>Timeline</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/goals'))}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
                        >
                            <Target size={14} />
                            <span>Goals</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Actions" className="px-2 text-xs font-semibold text-zinc-500">
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/timeline'))}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
                        >
                            <Plus size={14} />
                            <span>New Log Entry</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => runCommand(() => {
                                // Quick hack to scroll to bottom of Dashboard for TemplateExporter
                                navigate('/');
                                setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
                            })}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
                        >
                            <FileText size={14} />
                            <span>Export Review</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                <div className="border-t border-zinc-800 p-2 px-4 flex justify-between items-center bg-zinc-900/50">
                    <span className="text-[10px] text-zinc-500">
                        Use <kbd className="font-mono bg-zinc-800 px-1 rounded text-zinc-400">↑</kbd> <kbd className="font-mono bg-zinc-800 px-1 rounded text-zinc-400">↓</kbd> to navigate
                    </span>
                    <span className="text-[10px] text-zinc-500">
                        <kbd className="font-mono bg-zinc-800 px-1 rounded text-zinc-400">Enter</kbd> to select
                    </span>
                </div>
            </Command>
        </div>
    )
}
