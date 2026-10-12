import React from 'react';
import { Heart, Phone, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer({ onOpenEmergency }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                C+
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight font-['Outfit']">
                CURO<span className="text-teal-400">PLUS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Designed specifically for individuals in rural and village regions to easily discover appropriate hospitals and specialist doctors in Nandyal and Kurnool without medical jargon.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Verified Supabase Database Records
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Home Page</Link></li>
              <li><Link to="/hospitals" className="hover:text-teal-400 transition-colors">Nandyal & Kurnool Hospitals</Link></li>
              <li><Link to="/doctors" className="hover:text-teal-400 transition-colors">Doctor Directory</Link></li>
              <li><Link to="/ai-guide" className="hover:text-teal-400 transition-colors">AI Health & Specialty Guide</Link></li>
            </ul>
          </div>

          {/* Cities Covered */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Regions Covered</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Nandyal District Hospitals</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Kurnool District Hospitals</li>
              <li className="text-slate-500 pt-1">More Andhra Pradesh cities coming soon</li>
            </ul>
          </div>

          {/* Emergency & Disclaimer */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> Emergency Guidance
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              In case of severe emergency symptoms (heart attack, accident, severe breathlessness), do not wait. Call emergency services:
            </p>
            <button
              onClick={onOpenEmergency}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              <Phone className="w-4 h-4" /> View Emergency Phone Numbers
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CUROPLUS Healthcare Discovery Platform. Built for Nandyal & Kurnool.</p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Made with</span> <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> <span>for rural healthcare accessibility</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
