import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import React, { useState, useEffect, useRef } from 'react'
import { Select } from './ui/Select'
import { Sparkles, LayoutTemplate } from 'lucide-react'
import { cn } from '../lib/utils'
import TemplateSelector from './TemplateSelector'
import suggestion from '../lib/suggestion'
import { db } from '../lib/db'
import 'tippy.js/dist/tippy.css'

const PROMPTS = [
    "What was the hardest bug you squashed today?",
    "Who did you help today?",
    "What new tech concept did you learn?",
    "What's a small win you haven't celebrated yet?",
    "Did you block anyone? Or were you blocked?",
    "What code did you delete today?"
];

export default function Composer({ onSave, className, initialContent }) {
    const [impact, setImpact] = useState('medium');
    const [prompt, setPrompt] = useState(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const idleTimerRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "What did you work on today? (Type / for commands, # for tags)",
            }),
            Mention.configure({
                HTMLAttributes: { class: 'mention-tag' },
                renderLabel: ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
                suggestion: suggestion
            }),
            BubbleMenuExtension.configure({
                element: document.querySelector('.bubble-menu'),
            }),
        ],
        content: initialContent || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert focus:outline-none max-w-none min-h-[100px]',
            },
            handleKeyDown: (view, event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    handleSave();
                    return true;
                }
                return false;
            }
        },
    });

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

        onSave(json, text, impact);
        editor.commands.clearContent();
        setImpact('medium');
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
                userId: 'guest', // or current user
                name,
                content: selectedHtml,
                createdAt: new Date().toISOString()
            });
            alert('Template saved!');
        }
    };

    const handleInsertTemplate = (htmlContent) => {
        if (editor) {
            editor.commands.insertContent(htmlContent);
            setShowTemplateSelector(false);
            editor.commands.focus();
        }
    };

    return (
        <div className={cn("relative group rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50", className)}>
            <div className="min-h-[120px] relative">
                {editor && (
                    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                        <button
                            onClick={handleSaveTemplate}
                            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg shadow-xl hover:bg-zinc-800 transition-colors text-xs font-medium"
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
                        className="absolute top-10 left-0 right-0 mx-auto w-max animate-in fade-in slide-in-from-bottom-2 bg-indigo-600/90 hover:bg-indigo-600 text-white px-4 py-2 rounded-full shadow-xl text-sm font-medium flex items-center gap-2 backdrop-blur cursor-pointer z-10 transition-all hover:scale-105"
                    >
                        <Sparkles size={16} />
                        {prompt}
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1 text-zinc-500">
                        <span>CMD+ENTER to save</span>
                    </div>

                    <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
                        <span className="text-zinc-500">Impact:</span>
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
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTemplateSelector(true)}
                        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-zinc-700 hover:border-zinc-600"
                        title="Insert Template"
                    >
                        <LayoutTemplate size={14} />
                        <span>Template</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!editor || editor.isEmpty}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
