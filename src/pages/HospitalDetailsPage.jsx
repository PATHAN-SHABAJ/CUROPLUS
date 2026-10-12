import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Hospital, MapPin, UserCheck, Search, ExternalLink, ArrowLeft, Stethoscope, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function HospitalDetailsPage() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalAndDoctors();
  }, [id]);

  const fetchHospitalAndDoctors = async () => {
    setLoading(true);
    try {
      // Fetch Hospital record
      const { data: hospData, error: hospErr } = await supabase.from('hospitals').select('*').eq('id', id).single();
      if (hospErr) throw hospErr;

      // Fetch Doctors belonging to this hospital
      const { data: docData, error: docErr } = await supabase.from('doctors').select('*').eq('hospital_id', id);
      if (docErr) throw docErr;

      setHospital(hospData);
      setDoctors(docData || []);
    } catch (err) {
      console.error('Error fetching hospital details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get list of unique departments
  const departments = ['All', ...new Set(doctors.map(d => d.department).filter(Boolean))];

  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDept === 'All' || doc.department === selectedDept;
    const matchesSearch = !searchDoctor.trim() || 
      (doc.name && doc.name.toLowerCase().includes(searchDoctor.toLowerCase())) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(searchDoctor.toLowerCase())) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(searchDoctor.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-slate-600">Loading Hospital Details...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 font-['Outfit']">Hospital Not Found</h2>
        <p className="text-xs text-slate-500">The requested hospital record could not be found in Supabase.</p>
        <Link to="/hospitals" className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold inline-block">
          Return to Hospitals List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <Link to="/hospitals" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Hospitals
      </Link>

      {/* Hospital Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-100 text-teal-800 text-xs font-extrabold px-3 py-1 rounded-full border border-teal-200">
                {hospital.city} District
              </span>
              <span className="text-xs text-slate-500 font-medium">Verified Supabase Hospital Record</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] mb-2">
              {hospital.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-teal-700" />
                {hospital.city}, {hospital.state || 'Andhra Pradesh'}
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <UserCheck className="w-4 h-4 text-teal-700" />
                {doctors.length} Doctors Enrolled
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {hospital.website_url && (
              <a
                href={hospital.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                Hospital Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <Link
              to="/ai-guide"
              className="w-full sm:w-auto px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Check Symptoms with AI
            </Link>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
              Doctors & Specialists ({doctors.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Browse actual medical practitioners recorded for {hospital.name}.
            </p>
          </div>

          {/* Search & Department Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by Department"
              className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                placeholder="Search doctor..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
            No doctors found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                    {doc.department && (
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full shrink-0">
                        {doc.department}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-4">
                    {doc.qualification ? (
                      <p className="font-medium text-slate-700">
                        <strong className="text-slate-900">Qualification:</strong> {doc.qualification}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">Qualification not available</p>
                    )}

                    {doc.specialization ? (
                      <p className="font-medium text-slate-700">
                        <strong className="text-slate-900">Specialization:</strong> {doc.specialization}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">Specialization not recorded</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link to={`/doctors/${doc.id}`} className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">
                    View Doctor Profile →
                  </Link>
                  <span className="text-[10px] text-slate-400 font-medium">Verified Record</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
