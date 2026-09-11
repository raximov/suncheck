import Link from "next/link";
import { Sun, Shield, LayoutTemplate } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-6xl font-bold text-slate-900 tracking-tight">
          <span className="text-brand-500">☀️</span> SunCheck
        </h1>
        <p className="text-2xl text-slate-600 font-medium">
          Check the sun before you build.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-brand-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-brand-600">
              <Sun size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Shadow Analysis</h3>
            <p className="text-slate-600">Generate high-precision shadow models for any building at any time.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-brand-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-brand-600">
              <Shield size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Insolation Check</h3>
            <p className="text-slate-600">Ensure regulatory compliance with minimum direct sunlight hours.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-brand-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-brand-600">
              <LayoutTemplate size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Compliance Reports</h3>
            <p className="text-slate-600">Export detailed insolation PDF reports for municipal approval.</p>
          </div>
        </div>

        <div className="pt-8">
          <Link 
            href="/project/demo" 
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-600 transition-colors text-lg"
          >
            Open Map
          </Link>
        </div>
      </div>
    </main>
  );
}
