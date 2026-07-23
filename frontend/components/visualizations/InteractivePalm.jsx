import React, { useState } from "react";
import { motion } from "framer-motion";

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function pt(p) {
  return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}

function cubic(s, c1, c2, e) {
  return `M ${pt(s)} C ${pt(c1)}, ${pt(c2)}, ${pt(e)}`;
}

// Scale a normalized [0..1] MediaPipe landmark into SVG space.
// Image placed at x=10,y=10 with width=380, height=480 inside viewBox 0 0 400 500.
function scl(lm) {
  return { x: 10 + lm.x * 380, y: 10 + lm.y * 480 };
}

/**
 * Compute all four palm line paths directly from 21 MediaPipe landmarks.
 * Thumb side is determined purely from landmark geometry (thumb tip vs pinky tip X position)
 * so it is immune to wrong/mirrored handedness labels from MediaPipe.
 */
function computePalmLines(lms) {
  const wrist    = scl(lms[0]);
  const thumbMcp = scl(lms[2]);
  const thumbTip = scl(lms[4]);
  const indexMcp = scl(lms[5]);
  const midMcp   = scl(lms[9]);
  const pinkyMcp = scl(lms[17]);
  const pinkyTip = scl(lms[20]);

  // Determine thumb side from actual pixel positions, not from MediaPipe label
  // (MediaPipe handedness can be wrong for uploaded photos vs selfie camera)
  const thumbOnRight = thumbTip.x > pinkyTip.x;
  // thumbDir: +1 means "toward thumb" = rightward;  -1 = leftward
  const thumbDir = thumbOnRight ? 1 : -1;

  // ─── HEART LINE ──────────────────────────────────────────────────────────
  // Runs across upper palm from pinky side to index/middle side, curving upward
  const heartS = { x: pinkyMcp.x - thumbDir * 22, y: pinkyMcp.y + 20 };
  const heartE = {
    x: lerp(indexMcp, midMcp, 0.45).x,
    y: lerp(indexMcp, midMcp, 0.45).y + 6
  };
  const heartC1 = { x: lerp(heartS, heartE, 0.25).x, y: heartS.y - 8 };
  const heartC2 = { x: lerp(heartS, heartE, 0.72).x, y: heartE.y + 18 };

  // ─── HEAD LINE ───────────────────────────────────────────────────────────
  // Runs across middle palm from thumb/index junction to pinky (ulnar) side
  const headS = {
    x: lerp(thumbMcp, indexMcp, 0.32).x,
    y: lerp(indexMcp, wrist, 0.38).y
  };
  const headE = {
    x: pinkyMcp.x - thumbDir * 18,
    y: lerp(pinkyMcp, wrist, 0.20).y
  };
  const headC1 = { x: lerp(headS, headE, 0.30).x, y: lerp(headS, headE, 0.30).y + 8  };
  const headC2 = { x: lerp(headS, headE, 0.68).x, y: lerp(headS, headE, 0.68).y + 14 };

  // ─── LIFE LINE ───────────────────────────────────────────────────────────
  // Arcs around the thenar eminence (thumb mount).
  // Starts between index and thumb bases, bulges outward past thumb mount, ends at wrist thumb-side.
  const lifeS = {
    x: lerp(indexMcp, thumbMcp, 0.40).x,
    y: lerp(indexMcp, thumbMcp, 0.40).y + 6
  };
  const lifeE = { x: wrist.x + thumbDir * 40, y: wrist.y - 10 };

  // Apex = the outward-most point of the arc, pushed past thumb MCP
  const apexX = thumbMcp.x - thumbDir * 45;
  const apexY = lerp(thumbMcp, wrist, 0.44).y;

  // Control points derived from the apex so the Bezier passes through it at ~t=0.5
  const lifeC1 = {
    x: lifeS.x - thumbDir * Math.abs(apexX - lifeS.x) * 0.88,
    y: lerp(lifeS, { x: apexX, y: apexY }, 0.38).y
  };
  const lifeC2 = {
    x: lifeE.x - thumbDir * Math.abs(apexX - lifeE.x) * 0.88,
    y: lerp({ x: apexX, y: apexY }, lifeE, 0.62).y
  };

  // ─── FATE LINE ───────────────────────────────────────────────────────────
  // Runs roughly vertically through palm center from wrist to middle finger base
  const fateS = lerp(wrist, midMcp, 0.05);
  const fateE = { x: midMcp.x, y: midMcp.y + 20 };
  const fateC1 = { x: lerp(fateS, fateE, 0.33).x + thumbDir * 4, y: lerp(fateS, fateE, 0.33).y };
  const fateC2 = { x: lerp(fateS, fateE, 0.66).x,                y: lerp(fateS, fateE, 0.66).y };

  return {
    lifeLine:  cubic(lifeS,  lifeC1,  lifeC2,  lifeE),
    headLine:  cubic(headS,  headC1,  headC2,  headE),
    heartLine: cubic(heartS, heartC1, heartC2, heartE),
    fateLine:  cubic(fateS,  fateC1,  fateC2,  fateE),
  };
}

export default function InteractivePalm({ onLineClick, linesData, uploadedImage, landmarks, handedness }) {
  const [hoveredLine, setHoveredLine] = useState(null);

  const lineDetails = {
    lifeLine:  { name: "Life Line",  iconName: "Heart",    iconEmoji: "heart",         color: "#FF6B6B" },
    heartLine: { name: "Heart Line", iconName: "Activity", iconEmoji: "heart_sparkle",  color: "#FF1493" },
    headLine:  { name: "Head Line",  iconName: "Brain",    iconEmoji: "brain",          color: "#4ECDC4" },
    fateLine:  { name: "Fate Line",  iconName: "Compass",  iconEmoji: "crystal",        color: "#9B59B6" }
  };

  const handleLineClick = (lineKey) => {
    if (linesData && linesData[lineKey] && onLineClick) {
      onLineClick({
        key: lineKey,
        name: lineDetails[lineKey].name,
        icon: lineDetails[lineKey].iconName,
        color: lineDetails[lineKey].color,
        ...linesData[lineKey]
      });
    }
  };

  // Compute landmark-driven paths
  let dynamicPaths = null;
  if (landmarks && landmarks.length >= 21) {
    try { dynamicPaths = computePalmLines(landmarks); }
    catch (e) { console.warn("Palm line compute error:", e); }
  }

  const getPath = (key) => {
    if (dynamicPaths) return dynamicPaths[key];
    if (key === "lifeLine")  return "M 148 228 C 135 260, 118 350, 170 430";
    if (key === "headLine")  return "M 148 230 C 185 235, 255 250, 295 280";
    if (key === "heartLine") return "M 295 190 C 240 165, 170 185, 148 218";
    if (key === "fateLine")  return "M 205 440 C 205 360, 208 280, 200 185";
    return "";
  };

  const handOutline = "M 130 460 C 115 440, 95 380, 95 330 C 95 315, 80 300, 70 290 C 55 275, 30 260, 45 235 C 55 220, 85 245, 105 270 C 105 230, 110 160, 115 110 C 118 90, 142 90, 142 110 C 142 150, 145 200, 148 220 C 148 180, 158 100, 165 60 C 168 40, 192 40, 192 60 C 192 120, 195 200, 198 220 C 198 180, 215 100, 222 75 C 225 55, 248 55, 248 75 C 248 140, 248 200, 248 230 C 248 190, 268 120, 275 110 C 278 95, 300 100, 298 120 C 292 180, 282 250, 285 300 C 288 340, 310 380, 310 405 C 310 440, 290 460, 270 460 Z";

  const glowFilter = (id, color) => (
    `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feGaussianBlur stdDeviation="8" result="b"/>` +
    `<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
  );

  return (
    <div className="interactive-palm-container" style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "80%", height: "80%",
        background: "radial-gradient(circle, rgba(155,89,182,0.15) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(20px)", pointerEvents: "none", zIndex: 0
      }} />

      <motion.svg
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewBox="0 0 400 500" width="100%" height="100%"
        style={{ display: "block", zIndex: 1, position: "relative" }}
      >
        <defs>
          <filter id="glow-life"  x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow-heart" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow-head"  x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow-fate"  x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <radialGradient id="hand-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1a113a" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#0b061d" stopOpacity="0.95"/>
          </radialGradient>
          <clipPath id="rect-clip">
            <rect x="10" y="10" width="380" height="480" rx="20" ry="20"/>
          </clipPath>
        </defs>

        <style>{`
          .hand-outline{stroke:#d4af37;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 8px rgba(212,175,55,0.25))}
          .palm-crease{fill:none;stroke:#4a348c;stroke-width:1.5;stroke-dasharray:4 2;opacity:0.6}
          .pline{fill:none;stroke-width:6;stroke-linecap:round;cursor:pointer;transition:all 0.3s ease}
          .pline:hover{stroke-width:9;opacity:1!important}
          @keyframes scan{0%{transform:translateY(20px);opacity:0.2}50%{transform:translateY(480px);opacity:0.8}100%{transform:translateY(20px);opacity:0.2}}
          .scanline{animation:scan 4s ease-in-out infinite;filter:drop-shadow(0 0 6px #00e5ff)}
        `}</style>

        {uploadedImage && (
          <image href={uploadedImage} x="10" y="10" width="380" height="480"
            preserveAspectRatio="xMidYMid slice" clipPath="url(#rect-clip)"
            style={{ filter: "brightness(0.9) contrast(1.1) saturate(1.1)" }} />
        )}

        {!uploadedImage && (
          <path className="hand-outline" d={handOutline} style={{ fill: "url(#hand-grad)" }} />
        )}

        {uploadedImage && (
          <line className="scanline" x1="30" y1="0" x2="370" y2="0"
            stroke="#00e5ff" strokeWidth="3.5" clipPath="url(#rect-clip)" />
        )}

        {!uploadedImage && (<>
          <path className="palm-crease" d="M 120 330 Q 150 360, 190 350"/>
          <path className="palm-crease" d="M 230 310 Q 255 330, 280 300"/>
          <path className="palm-crease" d="M 160 270 Q 180 290, 210 270"/>
          <path className="palm-crease" d="M 250 250 C 265 240, 270 210, 275 190"/>
          <path className="palm-crease" d="M 130 220 C 120 200, 115 170, 120 150"/>
        </>)}

        <path id="lifeLine"  className="pline" d={getPath("lifeLine")}  stroke="#FF6B6B" opacity={hoveredLine==="lifeLine"  ?1:0.82} style={{filter:hoveredLine==="lifeLine"  ?"url(#glow-life)" :"none"}} onMouseEnter={()=>setHoveredLine("lifeLine")}  onMouseLeave={()=>setHoveredLine(null)} onClick={()=>handleLineClick("lifeLine")} />
        <path id="headLine"  className="pline" d={getPath("headLine")}  stroke="#4ECDC4" opacity={hoveredLine==="headLine"  ?1:0.82} style={{filter:hoveredLine==="headLine"  ?"url(#glow-head)" :"none"}} onMouseEnter={()=>setHoveredLine("headLine")}  onMouseLeave={()=>setHoveredLine(null)} onClick={()=>handleLineClick("headLine")} />
        <path id="heartLine" className="pline" d={getPath("heartLine")} stroke="#FF1493" opacity={hoveredLine==="heartLine" ?1:0.82} style={{filter:hoveredLine==="heartLine" ?"url(#glow-heart)":"none"}} onMouseEnter={()=>setHoveredLine("heartLine")} onMouseLeave={()=>setHoveredLine(null)} onClick={()=>handleLineClick("heartLine")} />
        <path id="fateLine"  className="pline" d={getPath("fateLine")}  stroke="#9B59B6" opacity={hoveredLine==="fateLine"  ?1:0.82} style={{filter:hoveredLine==="fateLine"  ?"url(#glow-fate)" :"none"}} onMouseEnter={()=>setHoveredLine("fateLine")}  onMouseLeave={()=>setHoveredLine(null)} onClick={()=>handleLineClick("fateLine")} />
      </motion.svg>

      {hoveredLine && (
        <div style={{
          position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)",
          background:"rgba(15,10,35,0.9)", border:`1.5px solid ${lineDetails[hoveredLine].color}`,
          borderRadius:"8px", padding:"6px 14px", color:"#fff", fontSize:"0.85rem",
          boxShadow:`0 0 10px ${lineDetails[hoveredLine].color}40`, pointerEvents:"none",
          zIndex:10, fontFamily:"Cinzel,serif", display:"flex", alignItems:"center", gap:"6px"
        }}>
          <strong style={{ color: lineDetails[hoveredLine].color }}>
            {lineDetails[hoveredLine].name}
          </strong>
        </div>
      )}
    </div>
  );
}
