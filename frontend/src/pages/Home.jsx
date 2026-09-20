import React from 'react';
import Hero from '../components/Hero';
import PipelineFlow from '../components/PipelineFlow';
import LiveAuditSimulator from '../components/LiveAuditSimulator';
import DarkPatternCards from '../components/DarkPatternCards';
import ForensicEvidenceBreakdown from '../components/ForensicEvidenceBreakdown';
import FrictionScoreGauge from '../components/FrictionScoreGauge';
import ReceiptPreview from '../components/ReceiptPreview';
import SafetyNotice from '../components/SafetyNotice';

export default function Home() {
  return (
    <div className="home-cinematic-wrapper">
      {/* 1. Hero with 3D Canvas Radar & Visual Core */}
      <Hero />

      {/* 2. End-to-End Pipeline Architecture (6-node interactive track) */}
      <PipelineFlow />

      {/* 3. Live Interactive Audit Sandbox / Simulator */}
      <LiveAuditSimulator />

      {/* 4. Dark Pattern Cards (Authoritative 4 Categories) */}
      <DarkPatternCards />

      {/* 5. Forensic Evidence Breakdown (Visual Gemini AI Extraction) */}
      <ForensicEvidenceBreakdown />

      {/* 6. Interactive Friction Score Gauge (0-45 Rubric + Economic Impact) */}
      <FrictionScoreGauge />

      {/* 7. Certified Itemized Audit Receipt */}
      <ReceiptPreview />

      {/* 8. Mission & Safety Notice */}
      <SafetyNotice />
    </div>
  );
}
