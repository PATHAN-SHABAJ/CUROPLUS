import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Hospital, Sparkles, ArrowLeft, ExternalLink, Stethoscope, ShieldCheck, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AI_EXPLANATIONS = [
  { keywords: ['cardio', 'heart'], explanation: 'This doctor is a Heart Specialist. In simple words: They fix heart problems, high blood pressure, and chest pain.' },
  { keywords: ['psychiat', 'mental', 'psycholo'], explanation: 'This doctor is a Mental Health Specialist. In simple words: They help with sadness, stress, worry, and brain health.' },
  { keywords: ['gastro', 'stomach', 'liver'], explanation: 'This doctor is a Stomach Specialist. In simple words: They treat digestion, acid, liver, and stomach pain.' },
  { keywords: ['neuro', 'brain', 'nerve'], explanation: 'This doctor is a Brain & Nerve Specialist. In simple words: They treat severe headaches, seizures, and nerve problems.' },
  { keywords: ['paediatric', 'pediatric', 'child', 'infant'], explanation: 'This doctor is a Child Specialist. In simple words: They treat babies and children for fevers, growth, and infections.' },
  { keywords: ['ortho', 'bone'], explanation: 'This doctor is a Bone Specialist. In simple words: They fix broken bones, joint pain, and muscle problems.' },
  { keywords: ['pulmono', 'lung', 'chest', 'respira'], explanation: 'This doctor is a Lungs Specialist. In simple words: They treat coughs, asthma, and breathing problems.' },
  { keywords: ['gynaecolo', 'gynecolo', 'obstetric', 'women', 'matern'], explanation: 'This doctor is a Women\'s Health Specialist. In simple words: They help with pregnancy, safe delivery, and female health.' },
  { keywords: ['urolog', 'urine', 'bladder', 'kidney stone'], explanation: 'This doctor is a Urine & Kidney Specialist. In simple words: They treat kidney stones, urine infections, and male reproductive health.' },
  { keywords: ['nephrolo', 'kidney failure', 'dialysis'], explanation: 'This doctor is a Kidney Disease Specialist. In simple words: They treat serious kidney problems and perform dialysis.' },
  { keywords: ['dermato', 'skin', 'hair', 'nail'], explanation: 'This doctor is a Skin Specialist. In simple words: They treat skin rashes, allergies, pimples, and hair fall.' },
  { keywords: ['oncolo', 'cancer', 'tumor'], explanation: 'This doctor is a Cancer Specialist. In simple words: They diagnose and treat cancer and tumors.' },
  { keywords: ['ophthalmo', 'eye', 'vision'], explanation: 'This doctor is an Eye Specialist. In simple words: They treat eye pain, vision problems, and do cataract surgeries.' },
  { keywords: ['endocrinolo', 'diabet', 'thyroid', 'hormone'], explanation: 'This doctor is a Hormone & Diabetes Specialist. In simple words: They treat sugar (diabetes), thyroid problems, and hormone imbalances.' },
  { keywords: ['rheumatolo', 'arthritis', 'joint pain'], explanation: 'This doctor is a Joint Disease Specialist. In simple words: They treat arthritis, severe joint pain, and autoimmune diseases.' },
  { keywords: ['hemato', 'haemato', 'blood', 'anemia'], explanation: 'This doctor is a Blood Specialist. In simple words: They treat blood problems like anemia (low blood) and bleeding disorders.' },
  { keywords: ['general medicine', 'physician', 'internal medicine', 'general'], explanation: 'This doctor is a General Physician. In simple words: They check overall health, fevers, and refer you to other specialists if needed.' },
  { keywords: ['anaesthesia', 'anesthesia'], explanation: 'This doctor is an Anesthesia Specialist. In simple words: They make sure you feel no pain during operations.' },
  { keywords: ['critical care', 'icu', 'intensive', 'emergency'], explanation: 'This doctor is an ICU Specialist. In simple words: They take care of patients who are very sick and need 24-hour monitoring in the ICU.' },
  { keywords: ['dental', 'dentist', 'tooth', 'teeth'], explanation: 'This doctor is a Tooth Specialist. In simple words: They fix toothaches, gums, and clean your teeth.' },
  { keywords: ['ent', 'ear', 'nose', 'throat'], explanation: 'This doctor is an Ear, Nose, & Throat Specialist. In simple words: They treat hearing problems, throat pain, and sinus issues.' },
  { keywords: ['surgeo', 'surgery', 'surgeon'], explanation: 'This doctor is a Surgeon. In simple words: They perform operations to fix injuries or remove diseases.' },
  { keywords: ['radiolo', 'x-ray', 'scan', 'mri'], explanation: 'This doctor is a Scan Specialist. In simple words: They read X-rays, MRI, and CT scans to see inside the body.' },
  { keywords: ['patholo', 'lab', 'blood test'], explanation: 'This doctor is a Lab Specialist. In simple words: They check blood and tissue samples to find out what disease you have.' }
];

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    setLoading(true);
    setIsAnalyzing(true);
    try {
      const { data: docData } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (docData) {
        setDoctor(docData);
        
        if (docData.hospital_id) {
          const { data: hospData } = await supabase.from('hospitals').select('*').eq('id', docData.hospital_id).single();
          if (hospData) setHospital(hospData);
        }

        // Simulate AI analyzing specialization
        setTimeout(() => {
          generateAIExplanation(docData);
          setIsAnalyzing(false);
        }, 1500); // 1.5 seconds AI thinking animation
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIExplanation = (doc) => {
    const textToAnalyze = `${doc.department || ''} ${doc.specialization || ''} ${doc.qualification || ''}`.toLowerCase();
    
    let foundExplanation = '';
    for (const item of AI_EXPLANATIONS) {
      if (item.keywords.some(keyword => textToAnalyze.includes(keyword))) {
        foundExplanation = item.explanation;
        break;
      }
    }

    if (!foundExplanation) {
      foundExplanation = 'This doctor is a Medical Specialist. In simple words: They are highly trained to diagnose and treat specific health conditions.';
    }

    setAiExplanation(foundExplanation);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-slate-600">Loading Doctor Profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Doctor Not Found</h2>
        <Link to="/doctors" className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold inline-block">
          Return to Doctors List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-4xl">
      {/* Back button */}
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-teal-50 rounded-full flex items-center justify-center border-2 border-teal-100 shrink-0">
            <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-teal-700" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Verified Doctor Profile
                </span>
                {doctor.department && (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                    {doctor.department}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] mb-1">
                {doctor.name}
              </h1>
              {doctor.qualification && (
                <p className="text-sm font-bold text-teal-700">{doctor.qualification}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {hospital && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg shrink-0">
                    <Hospital className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Hospital</span>
                    <Link to={`/hospitals/${hospital.id}`} className="text-sm font-bold text-slate-800 hover:text-teal-700">
                      {hospital.name}
                    </Link>
                    <span className="block text-xs text-slate-500 mt-0.5">{hospital.city}, {hospital.state || 'AP'}</span>
                  </div>
                </div>
              )}
              
              {doctor.specialization && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg shrink-0">
                    <Stethoscope className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Specialization</span>
                    <span className="text-sm font-bold text-slate-800">{doctor.specialization}</span>
                  </div>
                </div>
              )}
            </div>

            {doctor.profile_url && (
              <div className="pt-4">
                <a
                  href={doctor.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  View Official Hospital Profile <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Explanation Box */}
      <div className="bg-gradient-to-br from-teal-50/80 to-cyan-50/50 rounded-3xl border border-teal-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute -right-8 -bottom-8 opacity-5 text-teal-700 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>

        <div className="flex items-center gap-2.5 mb-4 relative z-10">
          <div className="p-2 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-sm text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit']">
            AI Explanation
          </h3>
        </div>

        <div className="relative z-10 bg-white rounded-2xl p-5 sm:p-6 border border-teal-100 shadow-xs">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce"></div>
              </div>
              <p className="text-xs font-bold text-teal-700 animate-pulse">AI is reading the doctor's profile...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                <ShieldCheck className="w-3 h-3" /> Simple English Summary
              </span>
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
                {aiExplanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
