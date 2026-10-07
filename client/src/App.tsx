import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIChatDrawer } from './components/AIChatDrawer';
import { Discover } from './pages/Discover';
import { DeviceDetail } from './pages/DeviceDetail';
import { DonorDashboard } from './pages/DonorDashboard';
import { SeekerDashboard } from './pages/SeekerDashboard';
import { VerifierPortal } from './pages/VerifierPortal';
import { AdminPanel } from './pages/AdminPanel';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TrackTrace } from './pages/TrackTrace';

export const App: React.FC = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenAI={() => setIsAIOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/seeker" element={<SeekerDashboard />} />
          <Route path="/verifier" element={<VerifierPortal />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/track" element={<TrackTrace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <Footer />

      <AIChatDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
};

export default App;
