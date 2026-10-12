import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Hospital, Search, Filter, MapPin, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function DoctorsPage({ selectedCity, setSelectedCity }) {
  const [doctors, setDoctors] = useState([]);
  const [hospitalsMap, setHospitalsMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctorsAndHospitals();
  }, []);

  const fetchDoctorsAndHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch hospitals map
      const { data: hospData, error: hospErr } = await supabase.from('hospitals').select('*');
      if (hospErr) throw hospErr;

      const map = {};
      (hospData || []).forEach(h => {
        map[h.id] = h;
      });
      setHospitalsMap(map);

      // Fetch doctors
      const { data: docData, error: docErr } = await supabase.from('doctors').select('*');
      if (docErr) throw docErr;

      setDoctors(docData || []);
    } catch (err) {
      console.error('Error fetching doctors directory:', err);
      setError('Failed to load doctors from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['All', ...new Set(doctors.map(d => d.department).filter(Boolean))];

  const filteredDoctors = doctors.filter(doc => {
    const hosp = hospitalsMap[doc.hospital_id];
    const matchesCity = selectedCity === 'All' || (hosp && hosp.city === selectedCity);
    const matchesDept = selectedDept === 'All' || doc.department === selectedDept;
    
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (doc.name && doc.name.toLowerCase().includes(q)) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(q)) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
      (doc.department && doc.department.toLowerCase().includes(q)) ||
      (hosp && hosp.name.toLowerCase().includes(q));

    return matchesCity && matchesDept && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg">
        <div className="max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-300 bg-teal-900/80 border border-teal-500/30 px-3 py-1 rounded-full mb-3 inline-block">
            Doctor Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit'] mb-2">
            Find Specialists & Doctors
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 font-medium">
            Search verified doctors across hospitals in Nandyal and Kurnool. View qualifications, departments, and hospitals.
          </p>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* City Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">City:</span>
            {['All', 'Nandyal', 'Kurnool'].map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {city === 'All' ? 'All Cities' : city}
              </button>
            ))}
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs font-bold text-slate-500">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by Department"
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, hospital, qualification..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl text-xs sm:text-sm font-medium outline-hidden"
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm font-bold">{error}</p>
          <button onClick={fetchDoctorsAndHospitals} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDoctors.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-['Outfit']">No Matching Doctors</h3>
          <p className="text-xs text-slate-500">No doctor found matching your search criteria. Try clearing filters.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCity('All'); setSelectedDept('All'); }} className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl">
            Reset Filters
          </button>
        </div>
      )}

      {/* Doctors Grid */}
      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doc => {
            const hosp = hospitalsMap[doc.hospital_id];
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-6 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base font-['Outfit']">{doc.name}</h3>
                      {doc.qualification ? (
                        <p className="text-xs text-teal-800 font-semibold mt-0.5">{doc.qualification}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-0.5">Qualification not recorded</p>
                      )}
                    </div>
                    {doc.department && (
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full shrink-0">
                        {doc.department}
                      </span>
                    )}
                  </div>

                  {hosp && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 text-xs">
                      <Link to={`/hospitals/${hosp.id}`} className="font-bold text-slate-800 hover:text-teal-700 flex items-center gap-1.5 mb-1">
                        <Hospital className="w-3.5 h-3.5 text-teal-700" /> {hosp.name}
                      </Link>
                      <p className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" /> {hosp.city}, {hosp.state || 'Andhra Pradesh'}
                      </p>
                    </div>
                  )}

                  {doc.specialization && (
                    <p className="text-xs text-slate-600 mb-3">
                      <strong className="text-slate-800">Specialization:</strong> {doc.specialization}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {hosp ? (
                    <Link to={`/hospitals/${hosp.id}`} className="text-xs font-bold text-teal-700 hover:underline">
                      View Hospital →
                    </Link>
                  ) : <div></div>}

                  <Link to={`/doctors/${doc.id}`} className="text-xs font-bold text-cyan-700 hover:underline flex items-center gap-1">
                    View Doctor Profile →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
