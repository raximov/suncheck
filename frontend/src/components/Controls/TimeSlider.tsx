'use client';

interface TimeSliderProps {
    time: string; // HH:MM
    onChange: (time: string) => void;
}

export default function TimeSlider({ time, onChange }: TimeSliderProps) {
    const [hours, minutes] = time.split(':').map(Number);
    const initialMinutes = (hours * 60) + minutes;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        const h = Math.floor(val / 60).toString().padStart(2, '0');
        const m = (val % 60).toString().padStart(2, '0');
        onChange(`${h}:${m}`);
    };

    return (
        <div className="flex items-center space-x-3 flex-1">
            <div className="flex items-center space-x-1 shrink-0">
                <button
                    onClick={() => onChange('08:30')}
                    className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                        time === '08:30' ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Ertalabki quyosh (08:30)"
                >
                    🌅 08:30
                </button>
                <button
                    onClick={() => onChange('12:30')}
                    className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                        time === '12:30' ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Quyosh tushda / Tik (12:30)"
                >
                    ☀️ 12:30
                </button>
                <button
                    onClick={() => onChange('17:30')}
                    className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                        time === '17:30' ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Kechki shom quyoshi (17:30)"
                >
                    🌇 17:30
                </button>
            </div>

            <input 
                type="time"
                value={time}
                onChange={(e) => {
                    if (e.target.value) onChange(e.target.value);
                }}
                className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer"
                title="Soatni qo'lda kiritish"
            />

            <input 
                type="range" 
                min="0" 
                max="1439" 
                value={Number.isFinite(initialMinutes) ? initialMinutes : 720}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
        </div>
    );
}