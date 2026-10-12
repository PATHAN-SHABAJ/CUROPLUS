import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Stethoscope, Hospital, ShieldAlert, ArrowRight, CheckCircle2, HelpCircle, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

const SYMPTOM_MAPPINGS = [
  {
    keywords: ['chest', 'heart', 'bp', 'blood pressure', 'breath', 'cardio', 'pulse'],
    specialty: 'Cardiology',
    title: 'Heart & Circulation Specialist (Cardiologist)',
    explanation: 'A Cardiologist specializes in heart care, blood pressure problems, chest tightness, and heart rate irregularities.',
    departments: ['Cardiology', 'Cardiology Team', 'Critical Care']
  },
  {
    keywords: ['stomach', 'digest', 'belly', 'acid', 'gastric', 'liver', 'vomit', 'gut'],
    specialty: 'Gastroenterology',
    title: 'Digestive System Specialist (Gastroenterologist)',
    explanation: 'A Gastroenterologist helps with stomach pain, digestion problems, acidity, liver issues, and bowel disorders.',
    departments: ['Gastroenterology', 'Gastroenterology & Hepatalogy', 'Digestive diseases']
  },
  {
    keywords: ['head', 'headache', 'brain', 'nerve', 'seizure', 'dizzy', 'paralysis'],
    specialty: 'Neurology',
    title: 'Brain & Nervous System Specialist (Neurologist / Neurosurgeon)',
    explanation: 'Neurologists and Neurosurgeons treat severe headaches, dizziness, nerve pain, seizures, and brain/spine conditions.',
    departments: ['Neurology', 'Neuro Surgeon']
  },
  {
    keywords: ['child', 'baby', 'kid', 'pediatric', 'paediatric', 'infant', 'toddler'],
    specialty: 'Paediatrics',
    title: 'Child Care Specialist (Paediatrician)',
    explanation: 'A Paediatrician specializes in infant, child, and teenage health care, vaccinations, and growth issues.',
    departments: ['Paediatrics']
  },
  {
    keywords: ['woman', 'pregnancy', 'period', 'delivery', 'maternity', 'gynae', 'obgyn', 'female'],
    specialty: 'Obstetrics & Gynaecology',
    title: 'Women\'s Health & Pregnancy Specialist (Gynecologist)',
    explanation: 'Gynecologists and Obstetricians care for pregnancy, maternal health, delivery, and female reproductive health.',
    departments: ['Obstetrics & Gynaecology']
  },
  {
    keywords: ['bone', 'joint', 'fracture', 'knee', 'back pain', 'ortho', 'muscle'],
    specialty: 'Orthopaedics',
    title: 'Bone & Joint Specialist (Orthopaedist)',
    explanation: 'An Orthopaedist treats bone fractures, joint pain, arthritis, spine problems, and sports injuries.',
    departments: ['Orthopaedics', 'Orthopedics']
  },
  {
    keywords: ['lung', 'cough', 'asthma', 'respiratory', 'phlegm', 'tb'],
    specialty: 'Pulmonology',
    title: 'Lungs & Breathing Specialist (Pulmonologist)',
    explanation: 'A Pulmonologist treats lungs, chronic cough, asthma, allergy, and respiratory infections.',
    departments: ['Pulmonology']
  },
  {
    keywords: ['fever', 'infection', 'blood test', 'lab', 'bacteria', 'viral', 'microbiology'],
    specialty: 'General Medicine & Diagnostics',
    title: 'General Physician & Pathologist',
    explanation: 'Pathologists and General Physicians run lab tests, diagnose infections, and manage general fever or unexplained weakness.',
    departments: ['Pathologist', 'Microbiologist', 'General Medicine']
  }
];

export default function AISymptomGuide({ initialQuery = '', selectedCity = 'All' }) {
  const [query, setQuery] = useState(initialQuery);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [matchingDoctors, setMatchingDoctors] = useState([]);
  const [hospitalsMap, setHospitalsMap] = useState({});
  const [allHospitals, setAllHospitals] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleAnalyze(initialQuery);
    }
  }, [initialQuery]);

  const fetchInitialData = async () => {
    try {
      const { data: hospData } = await supabase.from('hospitals').select('*');
      if (hospData) {
        setAllHospitals(hospData);
        const map = {};
        hospData.forEach(h => map[h.id] = h);
        setHospitalsMap(map);
      }
    } catch (err) {
      console.error('Error loading hospitals:', err);
    }
  };

  const handleAnalyze = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI reasoning delay for smooth UX
    setTimeout(async () => {
      const lowerQ = searchQuery.toLowerCase();
      
      // Match mapping
      let matched = SYMPTOM_MAPPINGS.find(m => 
        m.keywords.some(k => lowerQ.includes(k))
      );

      if (!matched) {
        matched = {
          specialty: 'General Medicine',
          title: 'General Physician / Internal Medicine Specialist',
          explanation: `For "${searchQuery}", starting with a General Physician is recommended. They will evaluate your overall health and refer you to a specific specialist if required.`,
          departments: []
        };
      }

      setResult({
        query: searchQuery,
        matched
      });

      // Fetch matching doctors from Supabase
      try {
        const { data: docs } = await supabase.from('doctors').select('*');
        if (docs) {
          const filtered = docs.filter(d => {
            if (!d.name) return false;
            // Match department or specialization
            const dept = (d.department || '').toLowerCase();
            const spec = (d.specialization || '').toLowerCase();
            const qual = (d.qualification || '').toLowerCase();
            const targetSpec = matched.specialty.toLowerCase();
            
            const matchesDepartment = matched.departments.some(dep => 
              dept.includes(dep.toLowerCase()) || spec.includes(dep.toLowerCase())
            ) || dept.includes(targetSpec) || spec.includes(targetSpec) || qual.includes(targetSpec);

            // Filter city if selected
            if (selectedCity !== 'All') {
              const hosp = hospitalsMap[d.hospital_id];
              if (hosp && hosp.city !== selectedCity) {
                return false;
              }
            }

            return matchesDepartment;
          });

          setMatchingDoctors(filtered);
        }
      } catch (err) {
        console.error('Error fetching matching doctors:', err);
      }

      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-teal-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-cyan-700 text-white flex items-center justify-center shadow-md shadow-teal-700/20">
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse-subtle" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-['Outfit'] flex items-center gap-2">
            AI Health & Specialty Finder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Describe your symptom in plain words. We'll guide you to the right medical department.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Describe your health concern... (e.g., chest pain, stomach ache, fever, bone injury)"
            className="w-full pl-5 pr-32 py-4 text-sm sm:text-base bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-teal-600 rounded-2xl outline-hidden font-medium transition-all shadow-xs"
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !query.trim()}
            className="absolute right-2 top-2 bottom-2 px-5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Analyzing...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Find Specialty
              </>
            )}
          </button>
        </div>

        {/* Quick Example Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Try examples:
          </span>
          {['Chest pain & breathlessness', 'Stomach ache & acidity', 'Child fever', 'Pregnancy consultation', 'Headache & dizziness', 'Bone fracture'].map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                handleAnalyze(ex);
              }}
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 px-3 py-1 rounded-full border border-teal-200/60 font-medium transition-colors cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-slate-100 animate-fade-in">
          {/* AI Guidance Box */}
          <div className="bg-gradient-to-br from-teal-50/90 to-cyan-50/50 border border-teal-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/80 px-2.5 py-1 rounded-md mb-2 inline-block">
                  Recommended Medical Specialty
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit']">
                  {result.matched.title}
                </h3>
              </div>
              <Stethoscope className="w-8 h-8 text-teal-700 shrink-0" />
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mb-4">
              {result.matched.explanation}
            </p>

            {/* Safety Banner */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Important Safety Note:</strong> This AI suggestion helps you select the right hospital department. It is <em>not a medical diagnosis</em>. If you experience severe emergency symptoms, visit a hospital immediately or call 108.
              </div>
            </div>
          </div>

          {/* Matching Doctors & Hospitals from Supabase */}
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2 font-['Outfit']">
              <Hospital className="w-4 h-4 text-teal-700" />
              Available Specialist Doctors & Hospitals ({matchingDoctors.length})
            </h4>

            {matchingDoctors.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                No specific doctor matching "{result.matched.specialty}" recorded yet for {selectedCity === 'All' ? 'the current database' : selectedCity}. Try viewing all available hospitals.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingDoctors.slice(0, 6).map((doc) => {
                  const hosp = hospitalsMap[doc.hospital_id];
                  return (
                    <div 
                      key={doc.id}
                      className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{doc.name}</h5>
                            {doc.qualification && (
                              <p className="text-xs text-slate-500 font-medium">{doc.qualification}</p>
                            )}
                          </div>
                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full shrink-0">
                            {doc.department || result.matched.specialty}
                          </span>
                        </div>

                        {hosp && (
                          <div className="text-xs text-slate-600 font-medium mb-3 flex items-center gap-1.5">
                            <Hospital className="w-3.5 h-3.5 text-teal-700" />
                            <span>{hosp.name}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{hosp.city}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {hosp && (
                          <Link 
                            to={`/hospitals/${hosp.id}`}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                          >
                            View Hospital <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                        {doc.profile_url ? (
                          <a
                            href={doc.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-cyan-700 hover:underline"
                          >
                            Doctor Profile →
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">Profile info coming soon</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
