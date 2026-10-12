import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Target, Sparkles, ShieldCheck, Users, MapPin, Hospital, UserCheck, ArrowRight, Globe, BookOpen, Zap } from 'lucide-react';

const TEAM_VALUES = [
  {
    icon: Target,
    title: 'Our Mission',
    desc: 'To make quality healthcare information accessible to every person in rural Andhra Pradesh — without medical jargon, without confusion.'
  },
  {
    icon: Users,
    title: 'Who We Serve',
    desc: 'Families in villages and small towns across Nandyal and Kurnool districts who struggle to find the right hospital or doctor quickly.'
  },
  {
    icon: ShieldCheck,
    title: 'Verified Data',
    desc: 'Every hospital and doctor profile is sourced directly from official hospital websites — no guesswork, no false information.'
  },
  {
    icon: Sparkles,
    title: 'AI in Simple Words',
    desc: 'Our AI explains medical specializations in plain Telugu-friendly English so that anyone — young or old — can understand.'
  }
];

const FEATURES = [
  { icon: MapPin,    label: 'City-Based Search',     desc: 'Find hospitals in Kurnool or Nandyal instantly.' },
  { icon: Hospital,  label: 'Hospital Profiles',      desc: 'Browse verified hospital info, specialties & contacts.' },
  { icon: UserCheck, label: 'Doctor Directory',       desc: 'Real doctor names, qualifications, and departments.' },
  { icon: Sparkles,  label: 'AI Symptom Guide',       desc: 'Describe a symptom → AI maps it to the right specialist.' },
  { icon: Zap,       label: 'Instant Results',        desc: 'No sign-up needed. Search and find in seconds.' },
  { icon: Globe,     label: 'Rural-First Design',     desc: 'Large text, simple English, mobile-friendly layout.' },
];

export default function AboutPage() {
  return (
    <div className="space-y-0 pb-16">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/60 backdrop-blur border border-teal-500/30 text-teal-100 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <HeartHandshake className="w-4 h-4 text-amber-300" /> About CUROPLUS
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-['Outfit'] leading-tight mb-6">
            Healthcare Discovery<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-200 to-amber-200">
              Built for Rural India
            </span>
          </h1>

          <p className="text-base sm:text-xl text-teal-100/90 max-w-2xl mx-auto leading-relaxed mb-8">
            CUROPLUS is a free healthcare discovery platform that helps people in villages and small towns find the <strong>right hospital</strong> and <strong>right doctor</strong> — without needing to understand complex medical terms.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/hospitals" className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all">
              Browse Hospitals <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/ai-guide" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-2xl flex items-center gap-2 transition-all">
              <Sparkles className="w-4 h-4 text-amber-300" /> Try AI Guide
            </Link>
          </div>
        </div>
      </section>

      {/* TAGLINE STRIP */}
      <div className="bg-teal-700 text-white py-4 px-4 text-center">
        <p className="text-sm sm:text-base font-bold tracking-wide uppercase">
          Right Hospital &nbsp;·&nbsp; Right Doctor &nbsp;·&nbsp; Right Time
        </p>
      </div>

      {/* OUR VALUES */}
      <section className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            What Drives Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] mt-4">
            Why CUROPLUS Exists
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            In villages across Andhra Pradesh, people often go to the wrong doctor or hospital simply because they don't know where to look. We are changing that.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TEAM_VALUES.map((v) => (
            <div key={v.title} className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-soft shadow-hover flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <v.icon className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1 font-['Outfit']">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="bg-gradient-to-br from-slate-900 to-teal-950 text-white py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300 bg-teal-900/80 border border-amber-400/30 px-3 py-1 rounded-full">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] mt-4">
              Everything in One Place
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.label} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 flex gap-4 items-start transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-teal-700/40 border border-teal-500/30 flex items-center justify-center shrink-0 group-hover:bg-teal-700/60 transition-colors">
                  <f.icon className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-0.5">{f.label}</h4>
                  <p className="text-xs text-teal-200/80 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM WE SOLVE */}
      <section className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 sm:p-12 shadow-soft">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                The Problem
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mt-4 mb-4">
                Village families travel hours to the wrong hospital
              </h2>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  'They don\'t know which doctor treats which disease',
                  'Hospital websites are in English with complex terms',
                  'They have no easy way to find verified doctor lists',
                  'Valuable time is lost reaching the wrong specialist',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">●</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 bg-white rounded-2xl border border-teal-200 p-6 shadow-xs">
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 mb-4 inline-block">
                Our Solution
              </span>
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  'AI explains each specialty in simple, plain English',
                  'Symptom-to-doctor mapping with zero medical jargon',
                  'All hospitals and doctors verified from official sources',
                  'Free, fast, mobile-friendly — works on basic phones',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CURRENTLY COVERING */}
      <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            Currently Covering
          </h2>
          <p className="text-sm text-slate-500 mt-2">Active hospital and doctor data available for:</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {['Nandyal', 'Kurnool'].map((city) => (
            <span key={city} className="flex items-center gap-1.5 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-800 text-sm font-bold rounded-full">
              <MapPin className="w-3.5 h-3.5" /> {city}
            </span>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 font-medium">More cities coming soon — Kadapa, Anantapur, Tirupati</p>
      </section>

      {/* BUILT WITH */}
      <section className="bg-slate-50 border-t border-slate-200 py-10 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Built With</span>
          </div>
          <p className="text-sm text-slate-500">
            React · Vite · Supabase · Python Scraper · Tailwind CSS · Lucide Icons
          </p>
          <p className="text-xs text-slate-400 mt-3 font-medium italic">
            "Designed for people who need healthcare help the most — those who live far from the city."
          </p>
        </div>
      </section>

    </div>
  );
}
