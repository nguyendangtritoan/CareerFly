import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import Mention from '@tiptap/extension-mention'
import PlaceholderNode from '../lib/extensions/PlaceholderNode'

export default function LogEntry({ log, onDelete }) {
    const { content, dateIso } = log;

    const editor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            PlaceholderNode,
            Mention.configure({
                HTMLAttributes: {
                    class: 'text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded',
                },
            })
        ],
        content: content.body, // Load JSON
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert focus:outline-none max-w-none'
            }
        }
    });

    // Update logic if content changes
    useEffect(() => {
        if (editor && content.body) {
            editor.commands.setContent(content.body);
        }
    }, [content, editor]);

    return (
        <div className="group relative pl-8 pb-8 transition-colors">
            <div className="absolute -left-[4.5px] top-[5px] h-2 w-2 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-400 dark:bg-zinc-600 group-hover:bg-indigo-500 group-hover:scale-125 transition-all duration-300"></div>

            <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 mb-2 flex items-center justify-between h-4">
                <span>{new Date(dateIso).toLocaleString(undefined, {
                    weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'
                })}</span>
                <button onClick={() => onDelete(log.id)} className="opacity-0 group-hover:opacity-100 text-zinc-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-all p-1">
                    <Trash2 size={12} />
                </button>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
