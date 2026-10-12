import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Hospital, UserCheck, Sparkles, ArrowRight, ShieldCheck, HeartHandshake, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import AISymptomGuide from '../components/AISymptomGuide';

export default function HomePage({ selectedCity, setSelectedCity, onOpenEmergency }) {
  const navigate = useNavigate();
  const [symptomInput, setSymptomInput] = useState('');
  const [stats, setStats] = useState({ hospitals: 0, doctors: 0, nandyalCount: 0, kurnoolCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: hospData } = await supabase.from('hospitals').select('id, city');
      const { data: docData } = await supabase.from('doctors').select('id');

      if (hospData) {
        const nandyal = hospData.filter(h => h.city === 'Nandyal').length;
        const kurnool = hospData.filter(h => h.city === 'Kurnool').length;

        setStats({
          hospitals: hospData.length,
          doctors: docData ? docData.length : 0,
          nandyalCount: nandyal,
          kurnoolCount: kurnool
        });
      }
    } catch (err) {
      console.error('Error fetching home stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSymptomSearchSubmit = (e) => {
    e.preventDefault();
    if (symptomInput.trim()) {
      const cityParam = selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : '';
      navigate(`/ai-guide?query=${encodeURIComponent(symptomInput.trim())}${cityParam}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 rounded-b-[2.5rem] shadow-xl">
        {/* Subtle background glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-700/80 backdrop-blur-md border border-teal-500/40 text-teal-100 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Rural & Village Healthcare Discovery Platform
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-['Outfit'] leading-tight mb-4">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-200 to-amber-200">Right Hospital</span> for Your Health Needs
          </h1>

          <p className="text-base sm:text-xl text-teal-100/90 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            Right Hospital. Right Doctor. Right Time. Discover verified hospitals and doctors near your city without medical terminology.
          </p>

          <form 
            onSubmit={handleSymptomSearchSubmit}
            className="max-w-2xl mx-auto bg-white p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-teal-100"
          >
            {/* City Selector */}
            <div className="flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-teal-100/50 w-full sm:w-auto shrink-0">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <select
                value={selectedCity || ''}
                onChange={(e) => setSelectedCity(e.target.value || null)}
                className="bg-transparent text-slate-700 text-sm font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="">All Cities</option>
                <option value="Kurnool">Kurnool</option>
                <option value="Nandyal">Nandyal</option>
              </select>
            </div>

            <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
              <Search className="w-5 h-5 text-teal-700 shrink-0" />
              <input
                type="text"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="Describe your symptom... (e.g. chest pain, fever)"
                className="w-full bg-transparent text-slate-800 text-sm sm:text-base font-medium placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-800 hover:to-cyan-800 text-white font-bold text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Find Hospitals
            </button>
          </form>

          <p className="text-xs text-teal-200/80 mt-3 font-medium">
            You can also browse hospitals directly by selecting your city below.
          </p>
        </div>
      </section>

      {/* QUICK STATS & CITY SELECTION */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            Browse Hospitals by City
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Choose your nearest city to view active hospital profiles and doctors in Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Nandyal Card */}
          <div 
            onClick={() => {
              setSelectedCity('Nandyal');
              navigate('/hospitals');
            }}
            className={`group bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all cursor-pointer shadow-soft shadow-hover relative overflow-hidden ${
              selectedCity === 'Nandyal' ? 'border-teal-600 ring-4 ring-teal-100' : 'border-slate-100 hover:border-teal-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="bg-teal-50 text-teal-800 text-xs font-extrabold px-3 py-1 rounded-full border border-teal-200">
                Nandyal District
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 font-['Outfit']">
              Nandyal
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
              Hospitals including Udayananda, Indus Heart Institute, KVR Hospital, and Aarka.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hospital className="w-4 h-4 text-teal-700" />
                {stats.nandyalCount} Verified Hospitals
              </span>
              <span className="text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Explore Hospitals <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Kurnool Card */}
          <div 
            onClick={() => {
              setSelectedCity('Kurnool');
              navigate('/hospitals');
            }}
            className={`group bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all cursor-pointer shadow-soft shadow-hover relative overflow-hidden ${
              selectedCity === 'Kurnool' ? 'border-teal-600 ring-4 ring-teal-100' : 'border-slate-100 hover:border-teal-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="bg-cyan-50 text-cyan-800 text-xs font-extrabold px-3 py-1 rounded-full border border-cyan-200">
                Kurnool District
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 font-['Outfit']">
              Kurnool
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
              Major centers including Medicover Hospitals, KIMS, and regional specialists.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hospital className="w-4 h-4 text-cyan-700" />
                {stats.kurnoolCount} Verified Hospitals
              </span>
              <span className="text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Explore Hospitals <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CUROPLUS WORKS */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-white to-teal-50/50 rounded-3xl border border-teal-100 p-8 sm:p-12 shadow-soft">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-100/80 px-3 py-1 rounded-full">
              Simple Step-by-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] mt-3">
              How CUROPLUS Helps You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
              Designed for ease of use by families and villages across Andhra Pradesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Choose a City', desc: 'Select Nandyal or Kurnool to view nearby medical facilities.', icon: MapPin },
              { step: '2', title: 'Explore Hospitals', desc: 'Browse verified hospitals, locations, and available specialties.', icon: Hospital },
              { step: '3', title: 'Find Doctors', desc: 'See doctor names, qualifications, and profile details.', icon: UserCheck },
              { step: '4', title: 'Understand Specialties', desc: 'Use AI guidance to know which doctor fits your health concern.', icon: Sparkles }
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
                <div className="w-10 h-10 rounded-xl bg-teal-700 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  {item.step}
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1 font-['Outfit']">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMBEDDED AI SYMPTOM GUIDE ON HOME */}
      <section className="container mx-auto px-4 sm:px-6">
        <AISymptomGuide selectedCity={selectedCity} />
      </section>
    </div>
  );
}
