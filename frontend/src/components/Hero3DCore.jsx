import React, { useRef, useEffect } from 'react';

export default function Hero3DCore() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = 460);
    let height = (canvas.height = 460);
    let angle = 0;
    let scanAngle = 0;
    let isVisible = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const size = Math.min(Math.round(rect.width), 480);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = size * dpr;
      height = canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Pause rendering when offscreen (Performance Invariant)
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        lastTime = performance.now();
      }
    }, { threshold: 0.05 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Particle nodes for forensic trace
    const numParticles = 44;
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = 105 + Math.random() * 32;
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        origRadius: radius,
        speed: 0.003 + Math.random() * 0.004,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.35 ? '#FF5733' : '#38BDF8',
      });
    }

    const rotate3D = (x, y, z, rotX, rotY) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      return { x: x1, y: y2, z: z2 };
    };

    let currentMouseX = 0;
    let currentMouseY = 0;
    let lastTime = performance.now();

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const renderW = width / dpr;
      const renderH = height / dpr;
      const centerX = renderW / 2;
      const centerY = renderH / 2;

      ctx.clearRect(0, 0, renderW, renderH);

      currentMouseX += (mouseRef.current.targetX - currentMouseX) * 0.05;
      currentMouseY += (mouseRef.current.targetY - currentMouseY) * 0.05;

      const rotY = prefersReducedMotion ? 0.2 : angle + currentMouseX * 0.4;
      const rotX = prefersReducedMotion ? 0.15 : Math.sin(angle * 0.5) * 0.15 + currentMouseY * 0.3;

      if (!prefersReducedMotion) {
        angle += 0.006;
        scanAngle += 0.015;
      }

      // 1. Ambient Background Glow
      const ambientGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 160);
      ambientGrad.addColorStop(0, 'rgba(255, 87, 51, 0.25)');
      ambientGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.09)');
      ambientGrad.addColorStop(1, 'rgba(11, 15, 25, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
      ctx.fill();

      // 2. 3D Rings
      const rings = [
        { radius: 135, rotY: rotY * 1.2, rotX: 0.8 + rotX, color: 'rgba(255, 87, 51, 0.45)', width: 1.5 },
        { radius: 120, rotY: -rotY * 0.9, rotX: -0.6 + rotX, color: 'rgba(56, 189, 248, 0.35)', width: 1.2 },
        { radius: 150, rotY: rotY * 0.5, rotX: 0.2 + rotX * 0.5, color: 'rgba(255, 255, 255, 0.12)', width: 1 }
      ];

      rings.forEach((ring) => {
        ctx.beginPath();
        const steps = 64;
        let first = true;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const px = Math.cos(theta) * ring.radius;
          const pz = Math.sin(theta) * ring.radius;
          const py = 0;

          const p3 = rotate3D(px, py, pz, ring.rotX, ring.rotY);
          const fov = 400;
          const scale = fov / (fov + p3.z);
          const sx = centerX + p3.x * scale;
          const sy = centerY + p3.y * scale;

          if (first) {
            ctx.moveTo(sx, sy);
            first = false;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        ctx.stroke();
      });

      // 3. Orbiting Scanning Laser Arc
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(scanAngle);
      const scanBeam = ctx.createLinearGradient(0, -145, 0, 145);
      scanBeam.addColorStop(0, 'rgba(255, 87, 51, 0)');
      scanBeam.addColorStop(0.5, 'rgba(255, 87, 51, 0.85)');
      scanBeam.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.strokeStyle = scanBeam;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 130, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.stroke();
      ctx.restore();

      // 4. Central Spherical Core with Specular Highlight
      const coreRadius = 75;
      const coreGrad = ctx.createRadialGradient(
        centerX - coreRadius * 0.35 + currentMouseX * 15,
        centerY - coreRadius * 0.35 + currentMouseY * 15,
        5,
        centerX,
        centerY,
        coreRadius
      );
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      coreGrad.addColorStop(0.3, 'rgba(30, 41, 67, 0.88)');
      coreGrad.addColorStop(0.8, 'rgba(11, 15, 25, 0.98)');
      coreGrad.addColorStop(1, 'rgba(255, 87, 51, 0.4)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5. Central VISH Stylized Monogram
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.bezierCurveTo(-14, 12, -4, 22, 0, 24);
      ctx.bezierCurveTo(4, 22, 14, 12, 16, -14);
      ctx.lineTo(8, -14);
      ctx.bezierCurveTo(6, 4, 2, 12, 0, 14);
      ctx.bezierCurveTo(-2, 12, -6, 4, -8, -14);
      ctx.closePath();
      ctx.fillStyle = '#FF5733';
      ctx.shadowColor = 'rgba(255, 87, 51, 0.8)';
      ctx.shadowBlur = 16;
      ctx.fill();

      // Accent dot
      ctx.beginPath();
      ctx.arc(14, -20, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FF5733';
      ctx.fill();
      ctx.restore();

      // 6. Draw 3D Forensic Particles
      particles.sort((a, b) => {
        const pa = rotate3D(a.x, a.y, a.z, rotX, rotY);
        const pb = rotate3D(b.x, b.y, b.z, rotX, rotY);
        return pb.z - pa.z;
      });

      particles.forEach((p) => {
        const p3 = rotate3D(p.x, p.y, p.z, rotX, rotY);
        const fov = 400;
        const scale = fov / (fov + p3.z);
        const sx = centerX + p3.x * scale;
        const sy = centerY + p3.y * scale;

        const alpha = Math.max(0.15, Math.min(1, (p3.z + 140) / 280));
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#FF5733' ? `rgba(255, 87, 51, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current = { targetX: x, targetY: y };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { targetX: 0, targetY: 0 };
  };

  return (
    <div
      ref={containerRef}
      className="forensic-core-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="VISH 3D Forensic Core Visualization"
    >
      <canvas ref={canvasRef} className="forensic-core-canvas" />

      {/* Tactical HUD Connector Lines to Core */}
      <svg className="hud-connector-svg" aria-hidden="true">
        {/* Top Left Connector */}
        <line x1="28%" y1="24%" x2="38%" y2="36%" className="hud-connector-line" />
        <circle cx="38%" cy="36%" r="2.5" className="hud-connector-point point-coral" />

        {/* Top Right Connector */}
        <line x1="72%" y1="21%" x2="62%" y2="35%" className="hud-connector-line" />
        <circle cx="62%" cy="35%" r="2.5" className="hud-connector-point point-blue" />

        {/* Bottom Left Connector */}
        <line x1="26%" y1="76%" x2="38%" y2="64%" className="hud-connector-line" />
        <circle cx="38%" cy="64%" r="2.5" className="hud-connector-point point-coral" />

        {/* Bottom Right Connector */}
        <line x1="74%" y1="78%" x2="62%" y2="65%" className="hud-connector-line" />
        <circle cx="62%" cy="65%" r="2.5" className="hud-connector-point point-blue" />
      </svg>

      {/* Floating Tactical Evidence Labels */}
      <div className="floating-label label-top-left">
        <span className="label-dot dot-coral" />
        <span className="label-text">DARK PATTERN DETECTED</span>
      </div>

      <div className="floating-label label-top-right">
        <span className="label-dot dot-blue" />
        <span className="label-text">AI VISION ACTIVE</span>
      </div>

      <div className="floating-label label-bottom-left">
        <span className="label-dot dot-coral" />
        <span className="label-text">EVIDENCE TRACE</span>
      </div>

      <div className="floating-label label-bottom-right">
        <span className="label-dot dot-blue" />
        <span className="label-text">BEHAVIOR MAPPED</span>
      </div>

      <div className="core-hud-status">
        <span className="hud-beacon" />
        <span className="hud-status-text">FORENSIC ENGINE · MULTIMODAL CORE</span>
      </div>
    </div>
  );
}
