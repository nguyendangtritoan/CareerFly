import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAddLog } from '../hooks/useLogs';
import Composer from './Composer';
import { cn } from '../lib/utils';

export default function MobileFab() {
    const [isOpen, setIsOpen] = useState(false);
    const addLog = useAddLog();

    const handleSave = (json, text, impact, date) => {
        addLog.mutate({ json, text, impact, date });
        setIsOpen(false);
    };

    return (
        <>
            {/* FAB Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden fixed bottom-20 right-4 z-50 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
                    aria-label="Add New Log"
                >
                    <Plus size={24} />
                </button>
            )}

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-zinc-950/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    {/* Close Area */}
                    <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

                    <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-10 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-zinc-100">New Log</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <Composer onSave={handleSave} className="border-0 bg-zinc-950 shadow-inner" />
                    </div>
                </div>
            )}
        </>
    );
}
