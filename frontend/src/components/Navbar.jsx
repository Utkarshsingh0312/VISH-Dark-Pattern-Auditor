import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Play, BarChart3, Terminal } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <svg className="brand-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            <circle cx="18" cy="4" r="2.5" fill="#FF5733" />
          </svg>
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
