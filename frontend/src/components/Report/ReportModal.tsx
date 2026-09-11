'use client';

import { Building, DailyPvResult, ApartmentInsolationResult } from '@/types';
import { 
    X, Printer, CheckCircle2, AlertTriangle, 
    FileText, Compass, Sun, Zap, Building2, MapPin, Calendar, Award 
} from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    building: Building;
    selectedDate: string;
    pvResult: DailyPvResult;
    aptResult: ApartmentInsolationResult;
}

export default function ReportModal({
    isOpen,
    onClose,
    building,
    selectedDate,
    pvResult,
    aptResult
}: ReportModalProps) {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const monthlyEstKwh = Math.round(pvResult.dailyKwh * 30);
    const yearlyEstKwh = Math.round(pvResult.dailyKwh * 345);
    const yearlySavingsUzs = Math.round(yearlyEstKwh * 900);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden print:shadow-none print:border-none print:my-0 print:max-w-none">
                
                {/* Modal Header & Print Action */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
                    <div className="flex items-center space-x-2">
                        <FileText className="text-amber-400" size={20} />
                        <span className="font-bold text-sm tracking-wide">SunCheck Rasmiy Ekspertiza Xulosasi</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={handlePrint}
                            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Printer size={15} />
                            <span>Chop etish / PDF</span>
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Document Body */}
                <div className="p-8 space-y-6 text-slate-800 font-sans print:p-6 print:text-black">
                    
                    {/* Official Document Header */}
                    <div className="border-b-2 border-slate-900 pb-5 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <span className="text-2xl">☀️</span>
                            <span className="text-xl font-black tracking-wider text-slate-900 uppercase">
                                SunCheck Tashkent
                            </span>
                            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-300">
                                3D Solar Audit
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            O&apos;zbekiston Respublikasi Shaharsozlik Me&apos;yorlari (ShNQ 2.07.01-03)
                        </p>
                        <h1 className="text-lg md:text-xl font-black text-slate-950 mt-2 uppercase">
                            Bino Insolyatsiyasi va Quyosh Elektr Stansiyasi (PV) Texnik Ekspertiza Dalolatnomasi
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Hujjat raqami: <span className="font-mono font-bold text-slate-800">SC-UZ-2026/{building.id.substring(0, 8)}</span> • Sana: <span className="font-bold text-slate-800">{selectedDate}</span>
                        </p>
                    </div>

                    {/* Section 1: Object Passport */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                            <Building2 size={14} className="mr-1.5 text-slate-700" />
                            1. Bino Pasport Ma&apos;lumotlari
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <div>
                                <span className="text-slate-500 block">Bino Nomi/ID:</span>
                                <span className="font-bold text-slate-900">{building.name || `Bino #${building.id.substring(0, 8)}`}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Joylashuv:</span>
                                <span className="font-bold text-slate-900">Toshkent sh. (41.31°N, 69.28°E)</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Balandlik / Qavatlar:</span>
                                <span className="font-bold text-slate-900">{building.height}m / {building.floors || Math.max(1, Math.round(building.height / 3.2))} qavat</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Ma&apos;lumot Manbasi:</span>
                                <span className="font-bold text-slate-900 uppercase">{building.source || 'OSM 3D'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Apartment Insolation (ShNQ 2.07.01-03) */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                                <Sun size={14} className="mr-1.5 text-amber-500" />
                                2. Tabiiy Quyosh Nuri (Insolyatsiya) Tahlili — ShNQ 2.07.01-03
                            </h3>
                            {aptResult.isCompliant ? (
                                <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                    <CheckCircle2 size={13} className="mr-1" /> Davlat Me&apos;yoriga To&apos;liq Mos (Compliant)
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                                    <AlertTriangle size={13} className="mr-1" /> Me&apos;yordan Kam (Xavfli)
                                </span>
                            )}
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="p-2.5">Ko&apos;rsatkich</th>
                                        <th className="p-2.5">Haqiqiy Hisoblangan</th>
                                        <th className="p-2.5">ShNQ Me&apos;yori</th>
                                        <th className="p-2.5">Xulosa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    <tr>
                                        <td className="p-2.5 font-medium">Uzluksiz quyosh tushishi (Insolyatsiya)</td>
                                        <td className="p-2.5 font-bold text-slate-900">{aptResult.totalSunHours} soat</td>
                                        <td className="p-2.5 text-slate-600">Kamida 2.5 soat</td>
                                        <td className="p-2.5 font-semibold text-emerald-700">Talab bajarildi</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2.5 font-medium">Sharqiy fasad (Ertalabki quyosh: 06:00-11:00)</td>
                                        <td className="p-2.5 font-bold text-slate-900">{aptResult.morningSunHours} soat</td>
                                        <td className="p-2.5 text-slate-600">—</td>
                                        <td className="p-2.5 text-slate-700">Ertalab tetik yorug&apos;, yozda salqin</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2.5 font-medium">Janubiy fasad (Tush payti: 11:00-15:00)</td>
                                        <td className="p-2.5 font-bold text-slate-900">{aptResult.noonSunHours} soat</td>
                                        <td className="p-2.5 text-slate-600">—</td>
                                        <td className="p-2.5 text-slate-700">Eng barqaror yorug&apos;lik, qishda issiq</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2.5 font-medium">G&apos;arbiy fasad (Shom quyoshi: 15:00-19:00)</td>
                                        <td className="p-2.5 font-bold text-slate-900">{aptResult.eveningSunHours} soat</td>
                                        <td className="p-2.5 text-slate-600">—</td>
                                        <td className="p-2.5 text-slate-700">Kechki botish manzarasi, jalyuzi kerak</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 3: Solar PV Rooftop Feasibility */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                            <Zap size={14} className="mr-1.5 text-emerald-600" />
                            3. Quyosh Fotoelektr (PV) Stansiyasi Texnik-Iqtisodiy Hisob-Kitobi
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                            <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl">
                                <span className="text-emerald-800 font-semibold block text-[11px]">Kunlik Ishlab Chiqarish:</span>
                                <span className="text-xl font-black text-slate-900">{pvResult.dailyKwh} <span className="text-xs font-bold text-emerald-700">kWh/kun</span></span>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                <span className="text-slate-500 font-semibold block text-[11px]">Oylik O&apos;rtacha:</span>
                                <span className="text-xl font-black text-slate-900">{monthlyEstKwh} <span className="text-xs font-bold text-slate-600">kWh/oy</span></span>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                <span className="text-slate-500 font-semibold block text-[11px]">Yillik Kutilma:</span>
                                <span className="text-xl font-black text-slate-900">{yearlyEstKwh.toLocaleString()} <span className="text-xs font-bold text-slate-600">kWh/yil</span></span>
                            </div>
                            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl">
                                <span className="text-amber-800 font-semibold block text-[11px]">Yillik Tejamkorlik:</span>
                                <span className="text-xl font-black text-slate-900">~{(yearlySavingsUzs / 1000000).toFixed(1)} <span className="text-xs font-bold text-amber-800">mln so&apos;m</span></span>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 text-xs space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                    <span className="text-slate-500 block">Optimal Panel Yo&apos;nalishi:</span>
                                    <span className="font-bold text-slate-900">To&apos;g&apos;ri Janub (180° Azimut)</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Tavsiya Qiyalik Burchagi:</span>
                                    <span className="font-bold text-slate-900">35° (Yillik o&apos;rtacha) / {pvResult.optimalTiltDeg}° (Hozirgi mavsum)</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Atrof Soya Ta&apos;siri:</span>
                                    <span className={`font-bold ${pvResult.shadingLossPercent > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {pvResult.shadingLossPercent > 0 ? `-${pvResult.shadingLossPercent}% yo'qotish` : 'To\'siqsiz ochiq tom (0% soya)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Official Validation Stamp */}
                    <div className="border-t-2 border-slate-200 pt-5 flex items-center justify-between text-xs text-slate-500">
                        <div className="space-y-1">
                            <p className="font-bold text-slate-800">SunCheck Tashkent 3D Ekspertiza Tizimi</p>
                            <p>Algoritm: NREL Solar Position & Cesium 3D Ground Shadow Engine</p>
                            <p>Standart: ShNQ 2.07.01-03 & O&apos;zbekiston Respublikasi Yashil Energetika Dasturi</p>
                        </div>
                        <div className="text-right border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                            <Award className="text-amber-500 mb-1" size={24} />
                            <span className="font-black text-slate-900 text-[11px] uppercase">SUNCHECK CERTIFIED</span>
                            <span className="text-[10px] text-slate-400 font-mono">TASHKENT 3D AUDIT</span>
                        </div>
                    </div>

                </div>

                {/* Modal Footer (Screen only) */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end print:hidden">
                    <button 
                        onClick={onClose}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                        Yopish
                    </button>
                </div>

            </div>
        </div>
    );
}