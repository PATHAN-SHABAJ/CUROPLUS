import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AISymptomGuide from '../components/AISymptomGuide';
import { Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function AIGuidePage({ selectedCity, setSelectedCity }) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  // If user came from home page with a city in URL, use that city
  const urlCity = searchParams.get('city') || '';
  const effectiveCity = urlCity || selectedCity;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300 bg-teal-950/80 border border-amber-400/30 px-3 py-1 rounded-full mb-3 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Health Assistant
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit'] mb-2">
            AI Symptom & Specialty Guidance
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 font-medium leading-relaxed">
            Understand medical terms in simple English. Tell us your symptom, and we'll point you to the right medical department and available specialists
            {effectiveCity ? ` in ${effectiveCity}` : ' in Nandyal & Kurnool'}.
          </p>
        </div>
      </div>

      <AISymptomGuide initialQuery={initialQuery} selectedCity={effectiveCity} />
    </div>
  );
}
