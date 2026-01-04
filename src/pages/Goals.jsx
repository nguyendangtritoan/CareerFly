import React, { useState } from 'react';
import { useGoals } from '../hooks/useLogs';
import { Target, Plus, CheckCircle, Circle, Trash2, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Goals() {
    const { goals, isLoading, addGoal, toggleGoalStatus, deleteGoal } = useGoals();
    const [isAdding, setIsAdding] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newGoal.title.trim()) return;

        addGoal.mutate(newGoal);
        setNewGoal({ title: '', description: '', targetDate: '' });
        setIsAdding(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pb-32">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Career Goals</h1>
                    <p className="text-text-secondary dark:text-zinc-400">Set targets and track your growth journey.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-action-primary hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> New Goal
                </button>
            </div>

            {isAdding && (
                <div className="mb-8 p-6 rounded-card border border-border-subtle dark:border-zinc-800 bg-surface dark:bg-zinc-900 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-1">Goal Title</label>
                            <input
                                type="text"
                                value={newGoal.title}
                                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                placeholder="e.g. Become a Senior Engineer"
                                className="w-full bg-white dark:bg-zinc-950 border border-border-input dark:border-zinc-800 rounded-lg p-2 text-sm text-text-primary dark:text-zinc-50 focus:outline-none focus:border-action-primary"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={newGoal.description}
                                    onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                                    placeholder="Success criteria..."
                                    className="w-full bg-white dark:bg-zinc-950 border border-border-input dark:border-zinc-800 rounded-lg p-2 text-sm text-text-primary dark:text-zinc-50 focus:outline-none focus:border-action-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-1">Target Date (Optional)</label>
                                <input
                                    type="date"
                                    value={newGoal.targetDate}
                                    onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                                    className="w-full bg-white dark:bg-zinc-950 border border-border-input dark:border-zinc-800 rounded-lg p-2 text-sm text-text-primary dark:text-zinc-50 focus:outline-none focus:border-action-primary"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1.5 text-xs text-text-secondary dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-action-primary hover:bg-action-hover text-white rounded-md text-xs font-medium"
                            >
                                Save Goal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    <div>Loading goals...</div>
                ) : !goals || goals.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Target size={48} className="mx-auto mb-4 text-zinc-600" />
                        <h3 className="text-lg font-medium text-zinc-400">No active goals</h3>
                        <p className="text-sm text-zinc-600">Start by setting a career objective above!</p>
                    </div>
                ) : (
                    goals.map(goal => (
                        <div key={goal.id} className={cn("group flex items-start gap-4 p-5 rounded-card border transition-all",
                            goal.status === 'completed' ? "bg-hover-bg dark:bg-zinc-900/50 border-border-subtle dark:border-zinc-800/50 opacity-60" : "bg-surface dark:bg-zinc-900 border-border-subtle dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                        )}>
                            <button
                                onClick={() => toggleGoalStatus.mutate({
                                    id: goal.id,
                                    status: goal.status === 'active' ? 'completed' : 'active'
                                })}
                                className={cn("mt-1 transition-colors", goal.status === 'completed' ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400")}
                            >
                                {goal.status === 'completed' ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </button>

                            <div className="flex-1">
                                <h3 className={cn("text-lg font-medium", goal.status === 'completed' && "line-through text-zinc-500")}>
                                    {goal.title}
                                </h3>
                                {goal.description && <p className="text-zinc-400 text-sm mt-1">{goal.description}</p>}

                                <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 font-mono">
                                    {goal.targetDate && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> Target: {goal.targetDate}
                                        </span>
                                    )}
                                    <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => confirm("Delete this goal?") && deleteGoal.mutate(goal.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
