import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export function Select({ value, onChange, options, className }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value) || options[0];

    return (
        <div className={cn("relative", className)} ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700/50 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            >
                <span className="text-zinc-500 dark:text-zinc-500 font-normal">Impact:</span>
                <span className={cn("capitalize",
                    value === 'high' ? 'text-indigo-600 dark:text-indigo-400' :
                        value === 'medium' ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-500 dark:text-zinc-400'
                )}>{selectedOption.label}</span>
                <ChevronDown size={12} className={cn("text-zinc-500 dark:text-zinc-500 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-32 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 backdrop-blur-xl p-1 shadow-2xl animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200 z-[100]">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "flex w-full items-center justify-between px-2 py-1.5 text-xs text-left rounded-md transition-colors",
                                option.value === value
                                    ? "bg-gray-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-medium"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                            )}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
