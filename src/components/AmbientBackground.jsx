/**
 * AmbientBackground.jsx
 * Full-screen canvas overlay that renders story-themed floating particles
 * and slow-drifting aurora fog blobs behind the gameplay UI.
 *
 * Themes:
 *   - zombie:    Red/orange embers rising upward
 *   - eldenring: Golden twinkling motes drifting gently
 *   - space:     Cool white-blue stars with slow twinkle
 *
 * Props:
 *   - storyId:    "zombie" | "eldenring" | "space" (selects particle theme)
 *   - accentColor: Hex color string for aurora fog tint (e.g. "#c23a3a")
 */

import { useEffect, useRef } from "react";

/* ---- Particle theme configs per story ---- */

const THEMES = {
  zombie: {
    count: 40,
    colors: [[194, 58, 58], [232, 120, 50], [180, 50, 35]],
    sizeRange: [1.5, 4],
    speedY: [-0.5, -0.12],
    speedX: [-0.2, 0.2],
    glow: 8,
    twinkle: false,
    opacity: [0.15, 0.55],
  },
  eldenring: {
    count: 35,
    colors: [[212, 168, 58], [232, 200, 100], [180, 140, 40]],
    sizeRange: [1, 3.5],
    speedY: [-0.18, 0.18],
    speedX: [-0.15, 0.15],
    glow: 6,
    twinkle: true,
    opacity: [0.12, 0.45],
  },
  space: {
    count: 60,
    colors: [[200, 215, 255], [150, 180, 240], [255, 255, 255]],
    sizeRange: [0.5, 2.5],
    speedY: [-0.06, 0.06],
    speedX: [-0.04, 0.04],
    glow: 3,
    twinkle: true,
    opacity: [0.15, 0.65],
  },
};

/* ---- Helpers ---- */

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(w, h, theme) {
  const color = theme.colors[Math.floor(Math.random() * theme.colors.length)];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: rand(theme.sizeRange[0], theme.sizeRange[1]),
    vx: rand(theme.speedX[0], theme.speedX[1]),
    vy: rand(theme.speedY[0], theme.speedY[1]),
    color,
    opacity: rand(theme.opacity[0], theme.opacity[1]),
    twinkleSpeed: theme.twinkle ? rand(0.008, 0.025) : 0,
    twinklePhase: Math.random() * Math.PI * 2,
    glow: theme.glow,
  };
}

function createBlob(w, h, rgb) {
  const cx = rand(w * 0.1, w * 0.9);
  const cy = rand(h * 0.1, h * 0.9);
  return {
    centerX: cx,
    centerY: cy,
    x: cx,
    y: cy,
    radius: rand(250, 450),
    driftVx: rand(-0.12, 0.12),
    driftVy: rand(-0.08, 0.08),
    color: rgb,
    opacity: rand(0.025, 0.055),
    angle: Math.random() * Math.PI * 2,
    orbitSpeed: rand(0.0003, 0.0007),
    orbitRadius: rand(60, 160),
  };
}

/* ---- Component ---- */

export default function AmbientBackground({ storyId, accentColor }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const theme = THEMES[storyId] || THEMES.zombie;

    /* Create particles */
    const particles = [];
    for (let i = 0; i < theme.count; i++) {
      particles.push(createParticle(w, h, theme));
    }

    /* Parse accent hex → RGB for aurora blobs */
    const hex = accentColor || "#c23a3a";
    const cr = parseInt(hex.slice(1, 3), 16);
    const cg = parseInt(hex.slice(3, 5), 16);
    const cb = parseInt(hex.slice(5, 7), 16);

    /* Create 3 aurora fog blobs */
    const blobs = [
      createBlob(w, h, [cr, cg, cb]),
      createBlob(w, h, [cr, cg, cb]),
      createBlob(w, h, [
        Math.min(255, cr + 30),
        Math.min(255, cg + 20),
        Math.min(255, cb + 20),
      ]),
    ];

    /* ---- Animation loop ---- */

    function draw() {
      ctx.clearRect(0, 0, w, h);

      /* Aurora fog blobs */
      for (const b of blobs) {
        b.angle += b.orbitSpeed;
        b.x = b.centerX + Math.cos(b.angle) * b.orbitRadius;
        b.y = b.centerY + Math.sin(b.angle * 0.7) * b.orbitRadius;

        b.centerX += b.driftVx;
        b.centerY += b.driftVy;

        if (b.centerX < -100 || b.centerX > w + 100) b.driftVx *= -1;
        if (b.centerY < -100 || b.centerY > h + 100) b.driftVy *= -1;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        grad.addColorStop(0, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${b.opacity})`);
        grad.addColorStop(1, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      /* Particles */
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap around edges */
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        /* Twinkle opacity */
        let alpha = p.opacity;
        if (p.twinkleSpeed > 0) {
          p.twinklePhase += p.twinkleSpeed;
          alpha *= 0.4 + 0.6 * Math.sin(p.twinklePhase);
        }

        ctx.save();
        if (p.glow > 0) {
          ctx.shadowBlur = p.glow;
          ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
        }
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    /* Handle window resize */
    function handleResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [storyId, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
