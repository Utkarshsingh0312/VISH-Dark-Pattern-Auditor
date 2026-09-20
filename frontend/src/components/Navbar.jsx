import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Brand Link */}
        <Link to="/" className="brand" onClick={closeMobileMenu}>
          <div className="brand-icon-wrapper">
            <img 
              src="/logo_mark.png" 
              alt="VISH Logo" 
              className="brand-icon"
            />
          </div>
          <div className="brand-text-block">
            <span className="brand-label">DARK PATTERN AUDITOR</span>
            <span className="brand-name">VISH</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Overview
          </Link>
          <Link 
            to="/audit" 
            className={`nav-link ${location.pathname.startsWith('/audit') ? 'active' : ''}`}
          >
            Audit Console
          </Link>
          <Link 
            to="/comparison" 
            className={`nav-link ${location.pathname === '/comparison' ? 'active' : ''}`}
          >
            Benchmarks
          </Link>
          <Link to="/audit" className="nav-cta">
            <span>Start an Audit</span>
            <ArrowRight size={14} />
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <Link 
            to="/" 
            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Overview
          </Link>
          <Link 
            to="/audit" 
            className={`mobile-nav-link ${location.pathname.startsWith('/audit') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Audit Console
          </Link>
          <Link 
            to="/comparison" 
            className={`mobile-nav-link ${location.pathname === '/comparison' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Benchmarks
          </Link>
          <div style={{ paddingTop: '0.75rem' }}>
            <Link 
              to="/audit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={closeMobileMenu}
            >
              <span>Start an Audit</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
