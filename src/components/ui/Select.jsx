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
                className="flex items-center gap-2 bg-zinc-950 text-zinc-300 border border-zinc-700 rounded-md px-2 py-1 text-xs hover:border-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            >
                {selectedOption.label}
                <ChevronDown size={12} className="text-zinc-500" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full min-w-[100px] rounded-md border border-zinc-800 bg-zinc-950 py-1 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "flex w-full items-center px-2 py-1.5 text-xs text-left hover:bg-zinc-800 transition-colors",
                                option.value === value ? "text-indigo-400 font-medium" : "text-zinc-300"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
