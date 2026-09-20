import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Play, BarChart3, Terminal } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <img 
            src="/logo_mark.png" 
            alt="VISH Logo" 
            className="brand-icon"
            style={{ objectFit: 'contain', width: '32px', height: '32px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 700 }}>DARK PATTERN AUDITOR</span>
            <span className="brand-name">VISH</span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Overview
          </Link>
          <Link to="/audit" className={`nav-link ${location.pathname.startsWith('/audit') ? 'active' : ''}`}>
            Audit Console
          </Link>
          <Link to="/comparison" className={`nav-link ${location.pathname === '/comparison' ? 'active' : ''}`}>
            Benchmarks
          </Link>
          <Link to="/audit" className="nav-cta">
            Start an Audit
          </Link>
        </nav>
      </div>
    </header>
  );
}
