import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import React, { useState, useEffect, useRef } from 'react'
import { DatePicker } from './ui/DatePicker'
import { Select } from './ui/Select'
import { Sparkles, LayoutTemplate } from 'lucide-react'
import { cn } from '../lib/utils'
import TemplateSelector from './TemplateSelector'
import PlaceholderNode from '../lib/extensions/PlaceholderNode'
import suggestion from '../lib/suggestion'
import categorySuggestion from '../lib/categorySuggestion'
import { db } from '../lib/db'

const PROMPTS = [
    "What was the hardest bug you squashed today?",
    "Who did you help today?",
    "What new tech concept did you learn?",
    "What's a small win you haven't celebrated yet?",
    "Did you block anyone? Or were you blocked?",
    "What code did you delete today?"
];

// Define a custom Mention extension for Performance Categories (@)
// using a different name so they don't conflict with normal mentions (#)
const PerformanceMention = Mention.extend({
    name: 'performanceMention',
});

import { useAuth } from '../hooks/useAuth';

export default function Composer({ onSave, className, initialContent }) {
    const [impact, setImpact] = useState('medium');
    const [logDate, setLogDate] = useState(new Date().toISOString());
    const [prompt, setPrompt] = useState(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const idleTimerRef = useRef(null);
    const { user } = useAuth();
    const userId = user ? user.uid : 'guest';

    const editor = useEditor({
        extensions: [
            StarterKit,
            PlaceholderNode,
            Placeholder.configure({
                placeholder: "What did you work on today? (Type / for commands, # for tags, @ for categories)",
            }),
            // 1. Tags (#) - Default Mention
            Mention.configure({
                HTMLAttributes: { class: 'mention-tag' },
                renderLabel: ({ node }) => `#${node.attrs.label ?? node.attrs.id}`,
                suggestion: {
                    ...suggestion,
                    char: '#'
                }
            }),
            // 2. Performance Categories (@) - Custom Extension
            PerformanceMention.configure({
                HTMLAttributes: { class: 'mention-category text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
                renderLabel: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
                suggestion: {
                    ...categorySuggestion,
                    char: '@'
                }
            }),
            BubbleMenuExtension.configure({
                element: document.querySelector('.bubble-menu'),
            }),
        ],
        content: initialContent || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert focus:outline-none max-w-none min-h-[60px]',
            },
            handleKeyDown: (view, event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    handleSave();
                    return true;
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            // Check if editor has any real content (text or filled placeholders)
            const hasText = editor.getText().trim().length > 0;
            // Check if there are placeholder nodes (templates have structure)
            const hasPlaceholders = editor.getJSON().content?.some(node =>
                node.type === 'placeholderNode' ||
                (node.content && node.content.some(n => n.type === 'placeholderNode'))
            );
            setIsEmpty(!hasText && !hasPlaceholders);
        }
    });

    const [isEmpty, setIsEmpty] = useState(true);

    // Idle Detection for Micro-Prompts
    useEffect(() => {
        if (!editor) return;

        const resetTimer = () => {
            if (prompt) setPrompt(null);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

            if (editor.isEmpty) {
                idleTimerRef.current = setTimeout(() => {
                    const random = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
                    setPrompt(random);
                }, 5000);
            }
        };

        editor.on('update', resetTimer);
        editor.on('focus', resetTimer);
        editor.on('blur', () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            setPrompt(null);
        });

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            editor.off('update', resetTimer);
            editor.off('focus', resetTimer);
            editor.off('blur');
        };
    }, [editor, prompt]);

    const handleSave = () => {
        if (!editor || editor.isEmpty) return;

        const json = editor.getJSON();
        const text = editor.getText();

        onSave(json, text, impact, logDate);
        editor.commands.clearContent();
        setImpact('medium');
        setLogDate(new Date().toISOString());
        setPrompt(null);
    };

    const handleSaveTemplate = async () => {
        const selection = editor.state.selection;
        if (selection.empty) return;

        const html = editor.getHTML().slice(selection.from, selection.to); // Simplified extraction
        // Better extraction:
        const slice = editor.state.selection.content();
        const serializer = editor.schema.DOMSerializer.fromSchema(editor.schema);
        const fragment = serializer.serializeFragment(slice.content);
        const div = document.createElement('div');
        div.appendChild(fragment);
        const selectedHtml = div.innerHTML;

        const name = prompt("Name your template:", "My Custom Template");
        if (name) {
            await db.templates.add({
                id: crypto.randomUUID(),
                userId: userId,
                name,
                content: selectedHtml,
                createdAt: new Date().toISOString()
            });
            alert('Template saved!');
        }
    };

    const handleInsertTemplate = (templateContent) => {
        if (editor) {
            // If it's JSON content (new format), use setContent
            if (typeof templateContent === 'object' && templateContent.type === 'doc') {
                editor.commands.setContent(templateContent);
            } else {
                // Fallback for old HTML format (custom templates)
                editor.commands.insertContent(templateContent);
            }
            setShowTemplateSelector(false);
            editor.commands.focus();

            // Focus on the first placeholder if it exists
            setTimeout(() => {
                const firstPlaceholder = editor.view.dom.querySelector('.placeholder-node');
                if (firstPlaceholder) {
                    const pos = editor.view.posAtDOM(firstPlaceholder, 0);
                    editor.commands.setTextSelection(pos + 1);
                }
            }, 50);
        }
    };

    return (
        <div className={cn("relative group rounded-card border border-border-input dark:border-zinc-800 bg-[#e8efe8] dark:bg-zinc-900 p-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 shadow-sm", className)}>
            <div className="min-h-[60px] relative">
                {editor && (
                    <BubbleMenu editor={editor}>
                        <button
                            onClick={handleSaveTemplate}
                            className="flex items-center gap-1.5 bg-surface dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 px-3 py-1.5 rounded-lg shadow-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
                        >
                            <Sparkles size={12} className="text-amber-500" />
                            Save as Template
                        </button>
                    </BubbleMenu>
                )}
                <EditorContent editor={editor} />
                {prompt && (
                    <button
                        onClick={() => {
                            editor.commands.setContent(`<h3>${prompt}</h3><p></p>`);
                            editor.commands.focus();
                            setPrompt(null);
                        }}
                        className="absolute top-10 left-0 right-0 mx-auto w-max animate-in fade-in slide-in-from-bottom-2 bg-action-primary/90 hover:bg-action-primary text-white px-4 py-2 rounded-full shadow-xl text-sm font-medium flex items-center gap-2 backdrop-blur cursor-pointer z-10 transition-all hover:scale-105"
                    >
                        <Sparkles size={16} />
                        {prompt}
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-border-subtle dark:border-zinc-800 gap-3">
                <div className="flex items-center gap-2">
                    <Select
                        value={impact}
                        onChange={setImpact}
                        options={[
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' }
                        ]}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DatePicker
                        date={logDate ? new Date(logDate) : undefined}
                        onSelect={(d) => setLogDate(d?.toISOString())}
                        placeholder="Today"
                        className="w-auto"
                        buttonClassName="w-auto border-0 bg-transparent text-zinc-400 hover:text-zinc-200 pl-0"
                        direction="top"
                    />
                    <button
                        onClick={() => setShowTemplateSelector(true)}
                        className="flex items-center gap-1.5 bg-tag-bg dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-800 text-text-secondary dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors h-8"
                        title="Insert Template"
                    >
                        <LayoutTemplate size={14} />
                        <span className="hidden sm:inline">Template</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!editor || isEmpty}
                        className="bg-action-primary hover:bg-action-hover text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-8 shadow-sm shadow-button/20"
                    >
                        Log Work
                    </button>
                </div>
            </div>

            {/* Template Selector Modal */}
            {showTemplateSelector && (
                <TemplateSelector
                    onSelect={handleInsertTemplate}
                    onCancel={() => setShowTemplateSelector(false)}
                />
            )}
        </div>
    )
}
