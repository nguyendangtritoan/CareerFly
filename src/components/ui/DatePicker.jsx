import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Minimal styling override for DayPicker to match Zinc theme
const css = `
  .rdp { --rdp-cell-size: 32px; --rdp-accent-color: #6366f1; --rdp-background-color: #27272a; margin: 0; }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #27272a; }
  .rdp-day_selected { background-color: #4f46e5; font-weight: bold; color: white; }
  .rdp-day_today { color: #818cf8; font-weight: bold; }
`;

export function DatePicker({ date, onSelect, className, placeholder = "Pick a date" }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (d) => {
        onSelect(d);
        setIsOpen(false);
    }

    return (
        <div className={cn("relative", className)} ref={ref}>
            <style>{css}</style>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-xs hover:border-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-zinc-300 w-full justify-start",
                    !date && "text-zinc-500"
                )}
            >
                <CalendarIcon size={14} />
                {date ? format(date, 'MMM d, yyyy') : <span>{placeholder}</span>}
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 p-2 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl animate-in fade-in zoom-in-95 left-0">
                    <DayPicker
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        styles={{
                            head_cell: { color: '#a1a1aa' },
                            caption: { color: '#e4e4e7' },
                            day: { color: '#e4e4e7' }
                        }}
                        modifiersClassNames={{
                            selected: 'bg-indigo-600 text-white rounded-md',
                            today: 'text-indigo-400 font-bold'
                        }}
                    />
                </div>
            )}
        </div>
    );
}
