import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { Trash2, Star } from 'lucide-react'
import { cn } from '../lib/utils'
import Mention from '@tiptap/extension-mention'
import PlaceholderNode from '../lib/extensions/PlaceholderNode'
import { HashtagDecoration } from '../lib/extensions/HashtagDecoration'
import { useToggleLogStar, useUpdateLog } from '../hooks/useLogs'

const PerformanceMention = Mention.extend({
    name: 'performanceMention',
});

export default function LogEntry({ log, onDelete, isManagerMode = false }) {
    const { content, dateIso, metadata } = log;
    const isHighImpact = metadata?.impact === 'high' || metadata?.isMajorWin;
    const isStarred = metadata?.isStarred || false;
    const toggleStar = useToggleLogStar();
    const updateLog = useUpdateLog();

    const [isEditing, setIsEditing] = useState(false);

    const editor = useEditor({
        editable: false, // Initially false
        extensions: [
            StarterKit,
            PlaceholderNode,
            // 1. Tags (#)
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention-tag',
                },
                renderLabel: ({ node }) => `#${node.attrs.label ?? node.attrs.id}`,
            }),
            // 2. Performance Categories (@)
            PerformanceMention.configure({
                HTMLAttributes: {
                    class: 'mention-category',
                },
                renderLabel: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
            }),
            HashtagDecoration
        ],
        content: content.body, // Load JSON
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm prose-invert focus:outline-none max-w-none',
                    isManagerMode && 'prose-lg'
                )
            }
        }
    });

    // Update logic if content changes externally, but ONLY if not editing
    useEffect(() => {
        if (editor && content.body && !isEditing) {
            editor.commands.setContent(content.body);
        }
    }, [content, editor, isEditing]);

    // Handle Edit Mode Toggle
    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditing);
        }
    }, [isEditing, editor]);

    const handleSave = () => {
        if (!editor) return;
        const json = editor.getJSON();
        const text = editor.getText();

        updateLog.mutate({
            id: log.id,
            json,
            text
        }, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset content
        if (editor) {
            editor.commands.setContent(content.body);
        }
    };

    return (
        <div className={cn(
            "group relative pl-8 pb-8 transition-colors",
            isManagerMode && "text-lg"
        )}>
            <div className={cn(
                "absolute -left-[4.5px] top-[5px] h-2 w-2 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-400 dark:bg-zinc-600 group-hover:bg-action-primary group-hover:scale-125 transition-all duration-300",
                isManagerMode && isHighImpact && "bg-amber-500 dark:bg-amber-400 scale-150"
            )}></div>

            <div className={cn(
                "text-[10px] font-mono text-zinc-500 dark:text-zinc-500 mb-2 flex items-center justify-between h-4",
                isManagerMode && "text-xs"
            )}>
                <div className="flex items-center gap-2">
                    <span>{new Date(dateIso).toLocaleString(undefined, {
                        weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'
                    })}</span>

                    {!isManagerMode && (
                        <button
                            onClick={() => toggleStar.mutate(log.id)}
                            className={cn(
                                "transition-colors p-0.5 rounded-sm",
                                isStarred
                                    ? "text-yellow-400 hover:text-yellow-500"
                                    : "text-zinc-300 dark:text-zinc-700 hover:text-yellow-400 opacity-0 group-hover:opacity-100"
                            )}
                            title={isStarred ? "Unstar" : "Star this log"}
                        >
                            <Star size={12} fill={isStarred ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>

                {!isManagerMode && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(true)} className="text-zinc-500 hover:text-[#39ff14] transition-all p-1 mr-1">
                                    Edit
                                </button>
                                <button onClick={() => onDelete(log.id)} className="text-zinc-500 hover:text-red-500 transition-all p-1">
                                    <Trash2 size={12} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleSave} className="text-green-600 hover:text-green-700 font-bold transition-all p-1 mr-1">
                                    Save
                                </button>
                                <button onClick={handleCancel} className="text-zinc-500 hover:text-zinc-700 transition-all p-1">
                                    Cancel
                                </button>
                            </>
                        )}

                    </div>
                )}
            </div>

            <div className={cn(
                "p-4 rounded-lg border border-border-subtle dark:border-zinc-800 bg-surface dark:bg-zinc-900/50 shadow-sm",
                isManagerMode && isHighImpact && "border-2 border-amber-500/50 bg-amber-500/5 shadow-amber-500/10",
                isManagerMode && "p-6",
                isEditing && "ring-2 ring-action-primary/20 border-action-primary"
            )}>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
