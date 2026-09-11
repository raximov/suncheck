'use client';

interface DatePickerProps {
    date: string;
    onChange: (date: string) => void;
}

export default function DatePicker({ date, onChange }: DatePickerProps) {
    return (
        <input 
            type="date" 
            value={date}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm text-slate-900"
        />
    );
}
