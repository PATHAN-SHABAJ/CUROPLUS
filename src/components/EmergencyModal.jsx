import React from 'react';
import { X, PhoneCall, AlertOctagon, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-red-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight font-['Outfit']">Immediate Emergency Guidance</h3>
              <p className="text-xs text-red-100 font-medium">For severe or life-threatening symptoms</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close emergency guidance modal"
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
            <strong className="block text-sm font-bold text-amber-950 mb-1 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-red-600" /> When to seek emergency care immediately:
            </strong>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Severe chest pain or pressure spreading to arms/neck</li>
              <li>Sudden difficulty breathing or gasping for air</li>
              <li>Sudden numbness, weakness in face or limbs, speech difficulty</li>
              <li>Unconsciousness, severe fainting, or sudden collapse</li>
              <li>Uncontrolled heavy bleeding or major traumatic injury</li>
            </ul>
          </div>

          {/* Emergency Phone Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="tel:108"
              className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl group transition-all"
            >
              <div>
                <span className="text-xs font-bold text-red-600 block">Ambulance Service</span>
                <span className="text-2xl font-black text-red-700">108</span>
              </div>
              <PhoneCall className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
            </a>

            <a 
              href="tel:102"
              className="flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl group transition-all"
            >
              <div>
                <span className="text-xs font-bold text-teal-700 block">Maternal & Child Care</span>
                <span className="text-2xl font-black text-teal-800">102</span>
              </div>
              <PhoneCall className="w-6 h-6 text-teal-700 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          <p className="text-[11px] text-slate-500 text-center italic">
            CUROPLUS is an informational discovery guide and does not provide emergency medical diagnosis or treatment.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
