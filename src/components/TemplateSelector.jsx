import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Command } from 'cmdk';
import { Sparkles, Hammer, Bug, Brain, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { STANDARD_TEMPLATES } from '../lib/templates';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function TemplateSelector({ onSelect, onCancel }) {
    const [search, setSearch] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Fetch custom templates
    const customTemplates = useLiveQuery(() => db.templates.toArray()) || [];

    const iconMap = {
        'Bug': Bug,
        'Hammer': Hammer,
        'Brain': Brain
    };

    if (!mounted) return null;

    return createPortal(
        <Command className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg overflow-hidden rounded-card border border-zinc-800 bg-zinc-950 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                <div className="flex items-center border-b border-zinc-800 px-3 shrink-0">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                    <Command.Input
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Choose a template..."
                        className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 text-zinc-100"
                    />
                </div>

                <Command.List className="overflow-y-auto p-2 scrollbar-hide flex-1">
                    <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                        No templates found.
                    </Command.Empty>

                    <Command.Group heading="Standard Library" className="px-2 py-1.5 text-xs font-medium text-zinc-500 mb-1">
                        {STANDARD_TEMPLATES.map(template => {
                            const Icon = iconMap[template.icon] || Sparkles;
                            return (
                                <Command.Item
                                    key={template.id}
                                    onSelect={() => onSelect(template.content)}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-50 text-zinc-300 group transition-colors"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 mr-3">
                                        <Icon className="h-4 w-4 text-zinc-400 group-data-[selected=true]:text-text-secondary" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium">{template.name}</span>
                                        <span className="text-[10px] text-zinc-500">{template.description}</span>
                                    </div>
                                </Command.Item>
                            );
                        })}
                    </Command.Group>

                    {customTemplates.length > 0 && (
                        <>
                            <div className="my-2 h-px bg-zinc-800 mx-2" />
                            <Command.Group heading="My Templates" className="px-2 py-1.5 text-xs font-medium text-zinc-500 mb-1">
                                {customTemplates.map(template => (
                                    <Command.Item
                                        key={template.id}
                                        onSelect={() => onSelect(template.content)}
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-50 text-zinc-300 group transition-colors"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 mr-3">
                                            <Sparkles className="h-4 w-4 text-amber-500/70" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium">{template.name}</span>
                                            <span className="text-[10px] text-zinc-500">Custom Template</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete template?')) db.templates.delete(template.id);
                                            }}
                                            className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:text-red-400"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        </>
                    )}
                </Command.List>

                <div className="border-t border-zinc-800 p-2 bg-zinc-900/50 flex justify-between items-center text-[10px] text-zinc-500 px-3">
                    <span>Use <b>↑↓</b> to navigate</span>
                    <span className="cursor-pointer hover:text-zinc-300" onClick={onCancel}>Esc to cancel</span>
                </div>
            </div>
            {/* Overlay click to close */}
            <div className="fixed inset-0 -z-10" onClick={onCancel}></div>
        </Command>,
        document.body
    );
}
