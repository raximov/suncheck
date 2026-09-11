'use client';

import { useState } from 'react';
import { Building } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import { calculateDailyPv, calculateApartmentInsolation } from '@/services/solarPvCalculator';
import { 
    Sun, Zap, ShieldCheck, ShieldAlert, Compass, 
    Home, Sparkles 
} from 'lucide-react';

interface BuildingInfoProps {
    building: Building;
}

export default function BuildingInfo({ building }: BuildingInfoProps) {
    const { selectedDate, selectedTime, setTime } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'apartment' | 'pv'>('apartment');
    const [pvCapacity, setPvCapacity] = useState<number>(5.0);
    const [buyerGoal, setBuyerGoal] = useState<'morning' | 'noon' | 'evening' | 'shade'>('morning');

    const pvResult = calculateDailyPv(building, selectedDate, pvCapacity);
    const aptResult = calculateApartmentInsolation(building, selectedDate);

    const currentHour = parseInt(selectedTime.split(':')[0], 10);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header info */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                        {building.source || '3D Bino'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {building.id.substring(0, 10)}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {building.name || `Toshkent binosi #${building.id.substring(0, 8)}`}
                </h2>
                <div className="mt-2 flex items-center space-x-3 text-xs text-slate-600">
                    <span className="flex items-center">
                        <span className="font-semibold text-slate-900 mr-1">{building.height}m</span> balandlik
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                        <span className="font-semibold text-slate-900 mr-1">{building.floors || Math.max(1, Math.round(building.height / 3.2))}</span> qavat
                    </span>
                </div>
            </div>

            {/* Tab switch */}
            <div className="flex border-b border-slate-200 bg-slate-100/70 p-1">
                <button
                    onClick={() => setActiveTab('apartment')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'apartment'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Home size={14} className={activeTab === 'apartment' ? 'text-amber-500' : ''} />
                    <span>🪟 Xonadon / Deraza</span>
                </button>
                <button
                    onClick={() => setActiveTab('pv')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'pv'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Zap size={14} className={activeTab === 'pv' ? 'text-amber-500' : ''} />
                    <span>⚡ Quyosh Paneli</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
                {activeTab === 'apartment' ? (
                    <>
                        {/* ShNQ Badge & Main metric */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-amber-900 flex items-center">
                                    <Sun size={14} className="text-amber-500 mr-1" /> To&apos;g&apos;ridan-to&apos;g&apos;ri Quyosh (Insolyatsiya)
                                </span>
                                {aptResult.isCompliant ? (
                                    <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                        <ShieldCheck size={12} className="mr-1" /> ShNQ me&apos;yoriga mos
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                                        <ShieldAlert size={12} className="mr-1" /> Me&apos;yordan kam
                                    </span>
                                )}
                            </div>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-black text-slate-900">{aptResult.totalSunHours}</span>
                                <span className="text-xs text-slate-600 font-medium">soat / kun (ShNQ kamida 2.5 soat talab qiladi)</span>
                            </div>
                            <div className="mt-2 text-[11px] text-slate-600 flex justify-between border-t border-amber-200/60 pt-2">
                                <span>🌅 Chiqish: <b>{aptResult.sunrise}</b></span>
                                <span>☀️ Kunduz: <b>{aptResult.daylightHours} soat</b></span>
                                <span>🌇 Botish: <b>{aptResult.sunset}</b></span>
                            </div>
                        </div>

                        {/* Facades breakdown */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Derazalar yo&apos;nalishi bo&apos;yicha quyosh:
                            </p>
                            
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg border border-slate-200 bg-slate-50">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase">🌅 Sharq (Ertalab)</div>
                                    <div className="text-base font-black text-slate-900 mt-0.5">{aptResult.morningSunHours} soat</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">06:00 - 11:00</div>
                                </div>
                                <div className="p-2 rounded-lg border border-amber-200 bg-amber-50/50">
                                    <div className="text-[11px] font-bold text-amber-800 uppercase">☀️ Janub (Tush)</div>
                                    <div className="text-base font-black text-amber-900 mt-0.5">{aptResult.noonSunHours} soat</div>
                                    <div className="text-[10px] text-amber-700 mt-0.5">11:00 - 15:00</div>
                                </div>
                                <div className="p-2 rounded-lg border border-slate-200 bg-slate-50">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase">🌇 G&apos;arb (Shom)</div>
                                    <div className="text-base font-black text-slate-900 mt-0.5">{aptResult.eveningSunHours} soat</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">15:00 - 19:00</div>
                                </div>
                            </div>
                        </div>

                        {/* Buyer preference recommendation helper */}
                        <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm space-y-2.5">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                                <Sparkles size={14} className="text-amber-500" />
                                <span>Uy oluvchi uchun tavsiya (Maqsadni tanlang):</span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    onClick={() => setBuyerGoal('morning')}
                                    className={`px-2 py-1.5 text-[11px] font-medium rounded border text-left transition-all ${
                                        buyerGoal === 'morning'
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    🌅 Faqat ertalab quyosh
                                </button>
                                <button
                                    onClick={() => setBuyerGoal('noon')}
                                    className={`px-2 py-1.5 text-[11px] font-medium rounded border text-left transition-all ${
                                        buyerGoal === 'noon'
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    ☀️ Doimiy yorug&apos;lik
                                </button>
                                <button
                                    onClick={() => setBuyerGoal('evening')}
                                    className={`px-2 py-1.5 text-[11px] font-medium rounded border text-left transition-all ${
                                        buyerGoal === 'evening'
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    🌇 Kechki shom quyoshi
                                </button>
                                <button
                                    onClick={() => setBuyerGoal('shade')}
                                    className={`px-2 py-1.5 text-[11px] font-medium rounded border text-left transition-all ${
                                        buyerGoal === 'shade'
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    ❄️ Umuman quyosh tushmasin
                                </button>
                            </div>

                            {/* Resulting advice */}
                            <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 border border-slate-200/80 leading-relaxed">
                                {buyerGoal === 'morning' && (
                                    <div>
                                        <b className="text-slate-900">👉 Sharqiy (East) derazali xonadonni tanlang:</b>
                                        <p className="mt-1 text-slate-600">
                                            Ertalab soat 06:30 dan 10:30 gacha yorug&apos; quyosh nuri tushadi. Tushdan keyin jaziramada xona tabiiy salqin bo&apos;lib qoladi, konditsioner kam talab etiladi.
                                        </p>
                                    </div>
                                )}
                                {buyerGoal === 'noon' && (
                                    <div>
                                        <b className="text-slate-900">👉 Janubiy (South) fasaddagi xonadonni tanlang:</b>
                                        <p className="mt-1 text-slate-600">
                                            Eng barqaror yillik insolyatsiya. Qish oylarida quyosh pastdan to&apos;g&apos;ri derazaga tushib uyni isitadi, yozda esa bino soyaboni tik quyoshni tabiiy to&apos;sadi.
                                        </p>
                                    </div>
                                )}
                                {buyerGoal === 'evening' && (
                                    <div>
                                        <b className="text-slate-900">👉 G&apos;arbiy (West) fasaddagi xonadonni tanlang:</b>
                                        <p className="mt-1 text-slate-600">
                                            Ertalab salqin. Ishdan uyga qaytganda quyosh botishi manzarasi ko&apos;rinadi. Yozda xona qizib ketmasligi uchun jalyuzi yoki parda kerak bo&apos;ladi.
                                        </p>
                                    </div>
                                )}
                                {buyerGoal === 'shade' && (
                                    <div>
                                        <b className="text-slate-900">👉 Shimoliy (North) fasad yoki pastki qavatni tanlang:</b>
                                        <p className="mt-1 text-slate-600">
                                            To&apos;g&apos;ridan-to&apos;g&apos;ri tik quyosh tushmaydi, faqat tarqoq yorug&apos;lik bo&apos;ladi. Toshkentning yozgi +45°C jaziramasida eng salqin va qulay xonadonlar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Timeline Bar */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">24-soatlik quyosh lentasi:</span>
                                <span>Tanlangan: <b className="text-slate-900">{selectedTime}</b></span>
                            </div>
                            <div className="flex h-7 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 p-0.5 gap-0.5">
                                {aptResult.timeline.map((item) => {
                                    const isCurrent = item.hour === currentHour;
                                    let bg = 'bg-slate-200';
                                    if (item.status === 'sunny') bg = 'bg-amber-400 hover:bg-amber-500';
                                    else if (item.status === 'shaded') bg = 'bg-slate-400 hover:bg-slate-500';

                                    return (
                                        <button
                                            key={item.hour}
                                            onClick={() => setTime(`${item.hour.toString().padStart(2, '0')}:00`)}
                                            title={`${item.timeStr} - ${item.status === 'sunny' ? 'Ochiq quyosh' : item.status === 'shaded' ? 'Soya' : 'Qorong\'u'}`}
                                            className={`flex-1 rounded-[3px] transition-all relative ${bg} ${
                                                isCurrent ? 'ring-2 ring-blue-600 ring-offset-1 z-10' : ''
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                                <span>05:00</span>
                                <span>09:00</span>
                                <span>13:00</span>
                                <span>17:00</span>
                                <span>21:00</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Daily PV Generation Highlight */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
                                <span className="flex items-center">
                                    <Zap size={14} className="text-emerald-600 mr-1" /> Kunlik Elektr Ishlab Chiqarish
                                </span>
                                <span className="bg-white/80 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                                    {selectedDate}
                                </span>
                            </div>
                            <div className="flex items-baseline space-x-2 my-1">
                                <span className="text-3xl font-black text-slate-900">{pvResult.dailyKwh}</span>
                                <span className="text-sm font-bold text-emerald-700">kWh / kun</span>
                            </div>
                            <div className="text-xs text-slate-600 flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/60">
                                <span>Mablag&apos; tejovi: <b>~{pvResult.dailySavingsUzs.toLocaleString()} so&apos;m/kun</b></span>
                                {pvResult.shadingLossPercent > 0 && (
                                    <span className="text-rose-600 font-semibold">
                                        -{pvResult.shadingLossPercent}% soya yo&apos;qotishi
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* PV System Capacity Selector */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">O&apos;rnatiladigan stansiya quvvati:</span>
                                <span className="font-semibold text-slate-900">{pvCapacity} kW</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[3, 5, 10, 20].map((kw) => (
                                    <button
                                        key={kw}
                                        onClick={() => setPvCapacity(kw)}
                                        className={`py-1.5 text-xs font-semibold rounded border transition-all ${
                                            pvCapacity === kw
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {kw} kW
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Optimal Angle & Direction for Tashkent */}
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                                <Compass size={14} className="text-emerald-600" />
                                <span>Toshkent uchun optimal o&apos;rnatish parametrlari:</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white p-2 rounded border border-slate-200">
                                    <div className="text-[11px] text-slate-500 font-medium">Optimal Yo&apos;nalish</div>
                                    <div className="text-sm font-bold text-slate-900 mt-0.5">To&apos;g&apos;ri Janub (180°)</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Shimoliy kenglik (41.3°N)</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-slate-200">
                                    <div className="text-[11px] text-slate-500 font-medium">Optimal Qiyalik (Tilt)</div>
                                    <div className="text-sm font-bold text-slate-900 mt-0.5">{pvResult.optimalTiltDeg}° burchak</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Yillik o&apos;rtacha: {pvResult.annualAvgTiltDeg}°</div>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">
                                💡 <b>Tavsiya:</b> Toshkentda quyosh yozda baland (20°-25° burchak), qishda esa past yuradi (50°-55° burchak). Statsionar panellar uchun <b>35° Janub</b> eng yuqori yillik samarani beradi.
                            </p>
                        </div>

                        {/* Hourly PV Output Curve */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">Kunlik soatbay generatsiya (kW):</span>
                                <span>Maksimal: <b className="text-slate-900">{pvResult.peakKw} kW</b></span>
                            </div>
                            
                            <div className="flex items-end h-20 gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                {pvResult.hourlyGeneration.filter(h => h.hour >= 6 && h.hour <= 19).map((record) => {
                                    const maxKw = pvResult.peakKw || 1;
                                    const heightPercent = Math.max(4, (record.pvKw / maxKw) * 100);
                                    const isCurrent = record.hour === currentHour;

                                    return (
                                        <div 
                                            key={record.hour} 
                                            className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                                            onClick={() => setTime(`${record.hour.toString().padStart(2, '0')}:00`)}
                                        >
                                            <div 
                                                className={`w-full rounded-t-sm transition-all duration-200 ${
                                                    isCurrent
                                                        ? 'bg-blue-600'
                                                        : record.isShaded
                                                        ? 'bg-slate-400'
                                                        : 'bg-emerald-500 group-hover:bg-emerald-600'
                                                }`}
                                                style={{ height: `${heightPercent}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 px-1">
                                <span>06:00</span>
                                <span>10:00</span>
                                <span>13:00 (Pik)</span>
                                <span>16:00</span>
                                <span>19:00</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}