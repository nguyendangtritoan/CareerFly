import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Dialog({ isOpen, onClose, title, children, className }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={cn(
                "relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200",
                className
            )}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <X size={16} />
                </button>
                {title && <h3 className="text-lg font-semibold text-zinc-100 mb-2 mr-6">{title}</h3>}
                {children}
            </div>
        </div>
    );
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default" // default | destructive
}) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            {description && <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{description}</p>}
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={cn(
                        "px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-sm",
                        variant === 'destructive'
                            ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                            : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                    )}
                >
                    {confirmText}
                </button>
            </div>
        </Dialog>
    );
}
