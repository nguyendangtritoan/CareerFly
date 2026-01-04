import React, { useState, useEffect } from 'react';
import { PartyPopper, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useLogs } from '../hooks/useLogs';
import { getWeekNumber } from '../lib/utils';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function FridayRitual() {
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0); // 0: Review, 1: Celebration
    const { logs } = useLogs();

    // Check for Friday > 3PM
    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const isFriday = now.getDay() === 5;
            const hour = now.getHours();

            // For testing/demo purposes, we can uncomment this to force show:
            setIsVisible(true); return;

            if (isFriday && hour >= 15) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const currentWeekLogs = logs?.filter(log => {
        const logDate = new Date(log.dateIso);
        const now = new Date();
        return getWeekNumber(logDate) === getWeekNumber(now) &&
            logDate.getFullYear() === now.getFullYear();
    }) || [];

    if (!isVisible && !isOpen) return null;

    return (
        <>
            {/* Trigger FAB */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000 group"
                >
                    <div className="absolute inset-0 bg-action-primary rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                    <div className="relative bg-action-primary hover:bg-action-primary text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-3 font-semibold transition-all hover:scale-105 active:scale-95">
                        <PartyPopper size={20} />
                        <span>Wrap Up Week</span>
                    </div>
                </button>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

                    <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
                        >
                            <X size={20} />
                        </button>

                        {step === 0 ? (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-action-primary/10 rounded-full flex items-center justify-center mx-auto text-text-secondary mb-4">
                                        <PartyPopper size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold">The Friday Ritual</h2>
                                    <p className="text-zinc-400">You crushed it this week. Let's review your wins.</p>
                                </div>

                                <div className="bg-zinc-900/50 rounded-card p-6 border border-zinc-800 overflow-y-auto max-h-[40vh] custom-scrollbar">
                                    <h3 className="text-sm font-semibold text-zinc-500 mb-4">THIS WEEK'S HIGHLIGHTS ({currentWeekLogs.length})</h3>

                                    {currentWeekLogs.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-500">
                                            No logs found this week. Did you forget to write them down?
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {currentWeekLogs.map(log => (
                                                <div key={log.id} className="flex gap-3 items-start p-3 bg-zinc-900 rounded-lg border border-zinc-800/50">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-action-primary shrink-0" />
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-zinc-300 line-clamp-2">
                                                            {log.content?.plainTextSnippet}
                                                        </div>
                                                        <div className="text-xs text-zinc-500 flex gap-2">
                                                            <span>{format(new Date(log.dateIso), 'EEE')}</span>
                                                            {log.tags?.map(tag => (
                                                                <span key={tag} className="text-text-secondary/80">#{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="bg-action-primary hover:bg-action-primary text-white px-6 py-3 rounded-card font-medium flex items-center gap-2 transition-all"
                                    >
                                        Complete Week <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 py-8 animate-in zoom-in ml-4">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-6 animate-bounce">
                                    <CheckCircle size={48} />
                                </div>

                                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                    Week Complete!
                                </h2>

                                <p className="text-zinc-400 max-w-md mx-auto">
                                    Great job capturing your progress. Disconnect and enjoy your weekend. You earned it.
                                </p>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setTimeout(() => setStep(0), 500);
                                    }}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-card font-medium transition-all"
                                >
                                    Close & Relax
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
