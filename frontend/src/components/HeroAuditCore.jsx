import React, { useRef, useEffect, useState } from 'react';
import { Shield, Sparkles, AlertTriangle, Eye, Activity, Cpu, CheckCircle, Terminal } from 'lucide-react';

export default function HeroAuditCore() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // High-performance Canvas animation for forensic radar & particle orbits
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let angle = 0;
    let pulse = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 28 }, (_, i) => ({
      orbitRadius: 90 + (i % 3) * 60 + Math.random() * 20,
      angle: (i / 28) * Math.PI * 2,
      speed: (0.004 + (i % 3) * 0.003) * (i % 2 === 0 ? 1 : -1),
      size: 1.5 + Math.random() * 2,
      color: i % 4 === 0 ? '#38BDF8' : i % 3 === 0 ? '#FF7A5C' : '#FF5733',
      alpha: 0.3 + Math.random() * 0.6
    }));

    const render = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      angle += 0.012;
      pulse += 0.03;

      // Concentric forensic radar range rings
      const rings = [70, 130, 190, 250];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 
          ? 'rgba(255, 87, 51, 0.22)' 
          : idx === 2 
            ? 'rgba(56, 189, 248, 0.15)' 
            : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx % 2 === 1 ? [4, 6] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Crosshair grid markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 260, cy);
      ctx.lineTo(cx + 260, cy);
      ctx.moveTo(cx, cy - 260);
      ctx.lineTo(cx, cy + 260);
      ctx.stroke();

      // Rotating radar sweep beam
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const sweepGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 240);
      sweepGradient.addColorStop(0, 'rgba(255, 87, 51, 0.28)');
      sweepGradient.addColorStop(0.5, 'rgba(255, 87, 51, 0.08)');
      sweepGradient.addColorStop(1, 'rgba(255, 87, 51, 0)');
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 240, -0.38, 0);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Leading beam ray
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(240, 0);
      ctx.strokeStyle = 'rgba(255, 122, 92, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Orbiting data nodes
      particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.orbitRadius;
        const py = cy + Math.sin(p.angle) * p.orbitRadius * 0.72;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.8 + 0.2 * Math.sin(pulse + p.orbitRadius));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // Central ambient glow
      const coreGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 100);
      coreGlow.addColorStop(0, 'rgba(226, 66, 55, 0.38)');
      coreGlow.addColorStop(0.6, 'rgba(255, 87, 51, 0.08)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y, targetX: x * 12, targetY: -y * 12 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0, targetX: 0, targetY: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="hero-audit-core-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1200px',
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        height: '520px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div 
        className="core-3d-stage"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${mousePos.targetY}deg) rotateY(${mousePos.targetX}deg)`,
          transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <canvas 
          ref={canvasRef} 
          className="core-radar-canvas"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            borderRadius: '24px',
          }}
        />

        <div className="hud-corner hud-corner-tl"></div>
        <div className="hud-corner hud-corner-tr"></div>
        <div className="hud-corner hud-corner-bl"></div>
        <div className="hud-corner hud-corner-br"></div>

        {/* Central 3D Levitating Brand Core */}
        <div 
          className="central-core-node"
          style={{ transform: 'translateZ(45px)' }}
        >
          <div className="core-rings-spinner">
            <div className="core-ring core-ring-1"></div>
            <div className="core-ring core-ring-2"></div>
            <div className="core-ring core-ring-3"></div>
          </div>
          
          <div className="core-logo-capsule">
            <img 
              src="/logo_mark.png" 
              alt="VISH Core Engine" 
              className="core-logo-graphic"
            />
            <div className="core-laser-sweep"></div>
          </div>
          <div className="core-pulse-beacon"></div>
        </div>

        {/* Floating Forensic Evidence Card 1: Top Right */}
        <div 
          className="orbit-evidence-card card-gemini"
          style={{
            top: '8%',
            right: '4%',
            transform: `translateZ(${isHovered ? '70px' : '55px'})`,
          }}
        >
          <div className="evidence-card-header">
            <Sparkles size={13} color="var(--accent-blue)" />
            <span className="card-tag">VISION AI ACTIVE</span>
            <span className="card-status-dot blue"></span>
          </div>
          <div className="evidence-card-body">
            <div className="evidence-title">Gemini 2.5 Flash</div>
            <div className="evidence-metric">
              <span>Confidence</span>
              <strong style={{ color: 'var(--accent-blue)' }}>98.4%</strong>
            </div>
          </div>
        </div>

        {/* Floating Forensic Evidence Card 2: Bottom Left */}
        <div 
          className="orbit-evidence-card card-detection"
          style={{
            bottom: '10%',
            left: '3%',
            transform: `translateZ(${isHovered ? '75px' : '60px'})`,
          }}
        >
          <div className="evidence-card-header">
            <AlertTriangle size={13} color="var(--accent-coral)" />
            <span className="card-tag" style={{ color: 'var(--accent-coral)' }}>PATTERN CAUGHT</span>
            <span className="card-status-dot coral"></span>
          </div>
          <div className="evidence-card-body">
            <div className="evidence-title">Confirmshaming</div>
            <div className="evidence-quote">"No, Thanks! I'll pay full price."</div>
            <div className="evidence-badge-tag">+7 Friction Pts</div>
          </div>
        </div>

        {/* Floating Telemetry Node 3: Top Left */}
        <div 
          className="orbit-evidence-card card-sandbox hide-mobile"
          style={{
            top: '16%',
            left: '4%',
            transform: `translateZ(${isHovered ? '50px' : '40px'})`,
          }}
        >
          <div className="evidence-card-header">
            <Cpu size={13} color="var(--accent-emerald)" />
            <span className="card-tag" style={{ color: 'var(--accent-emerald)' }}>AGENT SANDBOX</span>
          </div>
          <div className="evidence-card-body">
            <div className="evidence-title">Playwright 122</div>
            <div className="evidence-metric">
              <span>Safety Guard</span>
              <strong style={{ color: 'var(--accent-emerald)' }}>ZERO CHARGE</strong>
            </div>
          </div>
        </div>

        {/* Floating Telemetry Node 4: Bottom Right */}
        <div 
          className="orbit-evidence-card card-score"
          style={{
            bottom: '12%',
            right: '5%',
            transform: `translateZ(${isHovered ? '65px' : '50px'})`,
          }}
        >
          <div className="evidence-card-header">
            <Activity size={13} color="var(--accent-amber)" />
            <span className="card-tag" style={{ color: 'var(--accent-amber)' }}>RUBRIC 0–45</span>
          </div>
          <div className="evidence-card-body">
            <div className="evidence-metric">
              <span>Friction Score</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--accent-coral)' }}>07 / 45</strong>
            </div>
            <div className="score-mini-bar">
              <div className="score-mini-fill" style={{ width: '15.5%' }}></div>
            </div>
          </div>
        </div>

        {/* Holographic Technical Scan Status Bar */}
        <div 
          className="core-telemetry-hud"
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="hud-metric">
            <span className="hud-label">SCANNER</span>
            <span className="hud-value">OPTICAL HUD v2</span>
          </div>
          <div className="hud-separator"></div>
          <div className="hud-metric">
            <span className="hud-label">TARGET</span>
            <span className="hud-value active">LIVE DOM</span>
          </div>
          <div className="hud-separator"></div>
          <div className="hud-metric hide-mobile">
            <span className="hud-label">LATENCY</span>
            <span className="hud-value">16ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
