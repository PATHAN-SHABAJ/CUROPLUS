import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmergencyModal from './components/EmergencyModal';

// Pages
import HomePage from './pages/HomePage';
import HospitalsPage from './pages/HospitalsPage';
import HospitalDetailsPage from './pages/HospitalDetailsPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import AIGuidePage from './pages/AIGuidePage';
import AboutPage from './pages/AboutPage';

function App() {
  const [selectedCity, setSelectedCity] = useState('All');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0FDFA]">
      <Navbar 
        selectedCity={selectedCity} 
        setSelectedCity={setSelectedCity} 
        onOpenEmergency={() => setIsEmergencyOpen(true)} 
      />
      
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                selectedCity={selectedCity} 
                setSelectedCity={setSelectedCity} 
                onOpenEmergency={() => setIsEmergencyOpen(true)} 
              />
            } 
          />
          <Route 
            path="/hospitals" 
            element={
              <HospitalsPage 
                selectedCity={selectedCity} 
                setSelectedCity={setSelectedCity} 
              />
            } 
          />
          <Route 
            path="/hospitals/:id" 
            element={<HospitalDetailsPage />} 
          />
          <Route 
            path="/doctors" 
            element={
              <DoctorsPage 
                selectedCity={selectedCity} 
                setSelectedCity={setSelectedCity} 
              />
            } 
          />
          <Route 
            path="/doctors/:id" 
            element={<DoctorProfilePage />} 
          />
          <Route 
            path="/ai-guide" 
            element={<AIGuidePage selectedCity={selectedCity} />} 
          />
          <Route 
            path="/about" 
            element={<AboutPage />} 
          />
        </Routes>
      </main>

      <Footer onOpenEmergency={() => setIsEmergencyOpen(true)} />
      
      <EmergencyModal 
        isOpen={isEmergencyOpen} 
        onClose={() => setIsEmergencyOpen(false)} 
      />
    </div>
  );
}

export default App;
