import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Play, BarChart3, Terminal, Activity, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand" title="VISH — Dark Pattern Auditor">
          <div className="brand-icon-wrapper">
            <img 
              src="/logo_mark.png" 
              alt="VISH Logo" 
              className="brand-logo-img" 
            />
            <span className="brand-glow-halo"></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="brand-name">VISH</span>
              <span className="brand-badge-pill">AI FORENSICS</span>
            </div>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Dark Pattern Auditor
            </span>
          </div>
        </Link>

        {/* System telemetry indicator */}
        <div className="nav-system-status hide-mobile">
          <span className="status-beacon-dot"></span>
          <span className="status-beacon-text">CORE: READY</span>
          <span className="status-separator">/</span>
          <span className="status-detail">GEMINI VISION 2.5</span>
        </div>

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
          <Link to="/audit" className="nav-cta btn-glow">
            <span>Start an Audit</span>
            <ArrowUpRight size={14} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
