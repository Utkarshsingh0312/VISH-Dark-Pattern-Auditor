import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Audit from './pages/Audit';
import Results from './pages/Results';
import Comparison from './pages/Comparison';
import CursorGlow from './components/CursorGlow';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Subtle desktop interactive cursor halo */}
        <CursorGlow />

        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/results/:auditId" element={<Results />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <strong>VISH</strong> — Dark Pattern Auditor. <em>Every dark pattern, caught in the act.</em>
            </div>
            <div>
              Built for production MVP · Team Benefit Bridge
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
