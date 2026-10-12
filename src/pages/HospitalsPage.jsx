import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hospital, MapPin, Search, UserCheck, ExternalLink, ArrowRight, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function HospitalsPage({ selectedCity, setSelectedCity }) {
  const [hospitals, setHospitals] = useState([]);
  const [doctorCounts, setDoctorCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHospitalsAndCounts();
  }, []);

  const fetchHospitalsAndCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch hospitals
      const { data: hospData, error: hospErr } = await supabase.from('hospitals').select('*');
      if (hospErr) throw hospErr;

      // Fetch doctor records to count per hospital
      const { data: docData, error: docErr } = await supabase.from('doctors').select('id, hospital_id');
      if (docErr) throw docErr;

      const counts = {};
      if (docData) {
        docData.forEach(doc => {
          if (doc.hospital_id) {
            counts[doc.hospital_id] = (counts[doc.hospital_id] || 0) + 1;
          }
        });
      }

      setHospitals(hospData || []);
      setDoctorCounts(counts);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to load hospitals from Supabase. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    const matchesCity = selectedCity === 'All' || h.city === selectedCity;
    const matchesSearch = !searchQuery.trim() || 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (h.city && h.city.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-300 bg-teal-900/80 border border-teal-500/30 px-3 py-1 rounded-full mb-3 inline-block">
            Database Records
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit'] mb-2">
            Hospitals Directory
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 font-medium">
            Explore verified hospital entries for Nandyal and Kurnool. View available specialists and hospital websites.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        {/* City Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> City:
          </span>
          {['All', 'Nandyal', 'Kurnool'].map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {city === 'All' ? 'All Cities' : city}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hospital name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl text-xs sm:text-sm font-medium outline-hidden"
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-10 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={fetchHospitalsAndCounts}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Empty Results */}
      {!loading && !error && filteredHospitals.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
          <Hospital className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-['Outfit']">No Matching Hospitals Found</h3>
          <p className="text-xs text-slate-500">
            No hospital matching "{searchQuery}" in {selectedCity === 'All' ? 'all cities' : selectedCity}. Try clearing your search query.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCity('All'); }}
            className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl hover:bg-teal-800 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Hospital Cards Grid */}
      {!loading && !error && filteredHospitals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map(hosp => {
            const count = doctorCounts[hosp.id] || 0;
            return (
              <div
                key={hosp.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-6 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors font-['Outfit']">
                      {hosp.name}
                    </h3>
                    <span className="text-[11px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
                      {hosp.city || 'AP'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>{hosp.city}, {hosp.state || 'Andhra Pradesh'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>{count} Registered Doctors</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Link
                    to={`/hospitals/${hosp.id}`}
                    className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    View Hospital Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {hosp.website_url && (
                    <a
                      href={hosp.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 text-[11px] font-semibold text-slate-500 hover:text-teal-700 flex items-center justify-center gap-1"
                    >
                      Official Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
