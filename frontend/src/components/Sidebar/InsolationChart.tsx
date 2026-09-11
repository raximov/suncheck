export default function InsolationChart() {
    // Mock data representing hours from 6:00 to 18:00
    // 1 = sunlit, 0 = shaded
    const hourlyData = [0, 0.2, 0.8, 1, 1, 1, 1, 1, 0.5, 0, 0, 0, 0];
    const labels = ["6", "8", "10", "12", "14", "16", "18"];

    return (
        <div className="w-full">
            <div className="flex items-end h-24 gap-1 mb-2">
                {hourlyData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full">
                        <div 
                            className={`w-full rounded-t-sm transition-all duration-300 ${val > 0.5 ? 'bg-brand-400' : val > 0 ? 'bg-brand-200' : 'bg-slate-200'}`}
                            style={{ height: `${Math.max(val * 100, 5)}%` }}
                        ></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400">
                {labels.map((label, i) => (
                    <span key={i}>{label}</span>
                ))}
            </div>
        </div>
    );
}
