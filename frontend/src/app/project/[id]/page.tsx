'use client';

import { useProjectStore } from '@/store/useProjectStore';
import dynamic from 'next/dynamic';

const CesiumMap = dynamic(() => import('@/components/Map/CesiumMap'), {
    ssr: false,
});
import DatePicker from '@/components/Controls/DatePicker';
import TimeSlider from '@/components/Controls/TimeSlider';
import AnimationPlayer from '@/components/Controls/AnimationPlayer';
import BuildingInfo from '@/components/Sidebar/BuildingInfo';
import ReportModal from '@/components/Report/ReportModal';
import { FileText, Map as MapIcon, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectShadows } from '@/services/shadowCalculator';
import { calculateDailyPv, calculateApartmentInsolation } from '@/services/solarPvCalculator';

export default function ProjectPage({ params }: { params: { id: string } }) {
    const { 
        selectedDate, setDate, 
        selectedTime, setTime, 
        selectedDistrict, setDistrict,
        selectedBuilding, setSelectedBuilding,
        shadows, setShadows,
        buildings, setBuildings,
        isAnimating, setIsAnimating 
    } = useProjectStore();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [showShadows, setShowShadows] = useState(true);

    // Load 3D buildings when district changes
    useEffect(() => {
        const loadBuildings = async () => {
            try {
                let file = '/demo_buildings.json';
                if (selectedDistrict === 'all') {
                    file = '/tashkent_buildings.json';
                } else if (selectedDistrict !== 'it_park') {
                    file = `/districts/${selectedDistrict}.json`;
                }
                const res = await fetch(file);
                if (res.ok) {
                    const data = await res.json();
                    setBuildings(data);

                    // Auto-select a representative building for immediate analysis
                    if (data?.features?.length > 0) {
                        const target = data.features.find((f: any) => (f.properties?.height || 0) >= 14) || data.features[0];
                        if (target) {
                            const p = target.properties || {};
                            setSelectedBuilding({
                                id: String(p.id || target.id || 'bldg-1'),
                                name: p.name || undefined,
                                height: Number(p.height) || 17.5,
                                floors: Number(p.levels) || Math.max(1, Math.round((p.height || 17.5) / 3.2)),
                                source: p.source || 'OpenStreetMap',
                                properties: p,
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load buildings', err);
            }
        };
        loadBuildings();
    }, [selectedDistrict, setBuildings, setSelectedBuilding]);

    // Recalculate shadows when date or time slider changes
    useEffect(() => {
        if (!buildings) return;

        // Explicitly enforce Tashkent timezone (UTC+5)
        const dateString = `${selectedDate}T${selectedTime}:00+05:00`;
        const dateObj = new Date(dateString);

        const newShadows = projectShadows(buildings, dateObj);
        setShadows(newShadows);
    }, [buildings, selectedDate, selectedTime, setShadows]);

    const handleTimeIncrement = (minutes: number) => {
        const [h, m] = selectedTime.split(':').map(Number);
        let totalMins = (h * 60) + m + minutes;
        
        if (totalMins >= 1440) {
            setIsAnimating(false);
            totalMins = 1439;
        }

        const newH = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const newM = Math.floor(totalMins % 60).toString().padStart(2, '0');
        setTime(`${newH}:${newM}`);
    };

    const pvReportResult = selectedBuilding 
        ? calculateDailyPv(selectedBuilding, selectedDate, 5.0) 
        : null;
    const aptReportResult = selectedBuilding 
        ? calculateApartmentInsolation(selectedBuilding, selectedDate) 
        : null;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 justify-between z-10 shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-slate-800">☀️ SunCheck</span>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-slate-700">Toshkent 3D</span>
                    </div>

                    {/* District Selector across ALL Tashkent */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hudud:</span>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm max-w-[320px] truncate"
                        >
                            <option value="it_park">📍 Do&apos;rmon yo&apos;li / IT Park (2,880 bino)</option>
                            <option value="central">🏛️ Markaz / Amir Temur (6,211 bino)</option>
                            <option value="mirzo_ulugbek">🌳 Mirzo Ulug&apos;bek (12,765 bino)</option>
                            <option value="yunusobod">🏢 Yunusobod (16,575 bino)</option>
                            <option value="chilonzor">🏬 Chilonzor (15,170 bino)</option>
                            <option value="mirobod">🏦 Mirobod (12,175 bino)</option>
                            <option value="chorsu">🕌 Shayxontohur / Chorsu (19,525 bino)</option>
                            <option value="olmazor">🎓 Olmazor tumani (30,478 bino)</option>
                            <option value="yashnobod">✈️ Yashnobod tumani (27,121 bino)</option>
                            <option value="uchtepa">🏘️ Uchtepa tumani (24,041 bino)</option>
                            <option value="sergeli">🚆 Sergeli tumani (22,356 bino)</option>
                            <option value="bektemir">🏭 Bektemir tumani (19,819 bino)</option>
                            <option value="yangihayot">🏗️ Yangihayot tumani (17,103 bino)</option>
                            <option value="yakkasaroy">🌿 Yakkasaroy tumani (10,875 bino)</option>
                            <option value="all">🌐 Butun Toshkent shahri (199,615 bino)</option>
                        </select>
                        <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold hidden sm:inline-block">
                            {buildings?.features?.length?.toLocaleString() || 0} ta 3D bino yuklandi
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Shadow toggle button */}
                    <button
                        onClick={() => setShowShadows(!showShadows)}
                        className={`flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors ${
                            showShadows 
                                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                                : 'bg-slate-100 border-slate-300 text-slate-500'
                        }`}
                        title="Soyalarni ko'rsatish yoki yashirish"
                    >
                        {showShadows ? <Eye size={14} className="text-amber-600" /> : <EyeOff size={14} />}
                        <span className="hidden md:inline">Soyalar: {showShadows ? 'Yoqiq' : 'O\'chiq'}</span>
                    </button>

                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-md md:hidden"
                    >
                        {sidebarOpen ? <X size={20} /> : <MapIcon size={20} />}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Map Area */}
                <main className="flex-1 relative flex flex-col">
                    <div className="flex-1 relative">
                        <CesiumMap 
                            shadows={showShadows ? shadows : null} 
                            buildings={buildings} 
                        />
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className="h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                        <div className="flex items-center space-x-6 w-full max-w-4xl mx-auto">
                            <DatePicker date={selectedDate} onChange={setDate} />
                            
                            <AnimationPlayer 
                                isPlaying={isAnimating} 
                                onTogglePlay={() => setIsAnimating(!isAnimating)} 
                                onTimeIncrement={handleTimeIncrement}
                            />
                            
                            <div className="flex-1 px-4 border-l border-slate-200">
                                <TimeSlider time={selectedTime} onChange={setTime} />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className={`
                    w-96 lg:w-[410px] bg-white border-l border-slate-200 flex flex-col z-20 shrink-0
                    absolute right-0 top-0 bottom-0 transform transition-transform duration-300 md:relative md:transform-none
                    ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="flex-1 overflow-y-auto">
                        {selectedBuilding ? (
                            <BuildingInfo building={selectedBuilding} />
                        ) : (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                                <MapIcon size={48} className="mb-4 text-slate-300" />
                                <p>Xaritadan biror binoni tanlang.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Bottom action: Generate official report */}
                    <div className="p-3 border-t border-slate-200 bg-slate-50">
                        <button 
                            onClick={() => setIsReportOpen(true)}
                            className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            disabled={!selectedBuilding}
                        >
                            <FileText size={15} className="text-amber-400" />
                            <span>Rasmiy Audit Xulosasini Olish (PDF)</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Official Report Modal */}
            {selectedBuilding && pvReportResult && aptReportResult && (
                <ReportModal 
                    isOpen={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    building={selectedBuilding}
                    selectedDate={selectedDate}
                    pvResult={pvReportResult}
                    aptResult={aptReportResult}
                />
            )}
        </div>
    );
}