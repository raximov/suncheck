'use client';

import { Play, Pause, FastForward } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface AnimationPlayerProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onTimeIncrement: (amountMinutes: number) => void;
}

export default function AnimationPlayer({ isPlaying, onTogglePlay, onTimeIncrement }: AnimationPlayerProps) {
    const [speed, setSpeed] = useState(1);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                onTimeIncrement(speed * 15); // e.g. 15 minutes per interval based on speed
            }, 100);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, speed, onTimeIncrement]);

    const handleSpeedToggle = () => {
        const nextSpeed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
        setSpeed(nextSpeed);
    };

    return (
        <div className="flex items-center space-x-2">
            <button 
                onClick={onTogglePlay}
                className="p-2 bg-brand-500 text-white rounded-full hover:bg-brand-600 focus:outline-none transition-colors shadow-sm"
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>
            <button 
                onClick={handleSpeedToggle}
                className="flex items-center px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                title="Animation Speed"
            >
                <FastForward size={14} className="mr-1" />
                {speed}x
            </button>
        </div>
    );
}
