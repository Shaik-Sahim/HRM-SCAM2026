import React from 'react';

export function ProfuseLogo({ size = 42 }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Authentic Swirl Graphic */}
      <svg 
        width={size} 
        height={size} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          minWidth: `${size}px`, 
          maxWidth: `${size}px`, 
          flexShrink: 0 
        }} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" stroke="#f1f5f9" strokeWidth="2" />
        {/* Outer Orange Arc */}
        <path
          d="M 22,65 A 38,38 0 1,1 82,42"
          stroke="url(#profuseGrad)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Inner Gold Arc */}
        <path
          d="M 32,58 A 24,24 0 1,1 70,42"
          stroke="#F59E0B"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Core Dot */}
        <circle cx="50" cy="46" r="6" fill="#EA580C" />
        <defs>
          <linearGradient id="profuseGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.6" stopColor="#EA580C" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tracking-tight text-slate-900 font-sans leading-none">
            Pro<span className="text-amber-500">fuse</span>
          </span>
        </div>
        <p className="text-[8.5px] font-semibold tracking-wide text-slate-500 uppercase mt-0.5 font-sans leading-none">
          Transtech Solutions Private Limited
        </p>
      </div>
    </div>
  );
}

export function ProfuseHeader({ refId, dateStr, isConfidential = true }) {
  return (
    <div className="w-full mb-3 shrink-0">
      <div className="flex justify-between items-start">
        <ProfuseLogo />
        {isConfidential && (
          <div className="text-right">
            <span className="text-[11px] text-slate-600 font-sans tracking-tight block">
              Confidential, not to be disclosed
            </span>
            {dateStr && (
              <p className="text-[11.5px] font-bold text-slate-900 mt-0.5 font-sans">
                {dateStr.startsWith('Dated:') ? dateStr : `Dated: ${dateStr}`}
              </p>
            )}
          </div>
        )}
      </div>
      {refId && (
        <div className="mt-2 text-[11.5px] font-bold text-slate-900 font-sans">
          Emp Ref : <span className="font-mono">{refId}</span>
        </div>
      )}
    </div>
  );
}

export function ProfuseFooter() {
  return (
    <div className="w-full pt-2 mt-auto text-center border-t border-slate-200 select-none shrink-0">
      <h3 className="text-xs font-extrabold uppercase tracking-wide text-amber-600 font-sans">
        PROFUSE TRANSTECH SOLUTIONS PRIVATE LIMITED
      </h3>
      <p className="text-[9.5px] text-slate-700 font-medium mt-0.5 font-sans">
        6<sup>th</sup> Floor, Gamma Block, Sigma Soft Tech Park, Varthur Hobli, Bangalore-560066.
      </p>
      <p className="text-[9.5px] text-slate-600 font-mono mt-0.5">
        Phone: 080-95883256 &nbsp;|&nbsp; Email: hr@protps.com &nbsp;|&nbsp; Website: www.protps.com
      </p>
    </div>
  );
}

export function ProfuseStamp({ size = 92 }) {
  return (
    <div 
      className="relative select-none pointer-events-none inline-block"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        minWidth: `${size}px`, 
        minHeight: `${size}px`, 
        maxWidth: `${size}px`, 
        maxHeight: `${size}px`,
        position: 'relative'
      }}
    >
      {/* Official Blue Circular Stamp with Integrated Signature Overlay */}
      <svg 
        width={size} 
        height={size} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          minWidth: `${size}px`, 
          minHeight: `${size}px`, 
          maxWidth: `${size}px`, 
          maxHeight: `${size}px`,
          display: 'block' 
        }} 
        viewBox="0 0 140 140" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer dashed circle */}
        <circle cx="70" cy="70" r="65" stroke="#1e3a8a" strokeWidth="2.2" strokeDasharray="3 2" opacity="0.95" />
        {/* Inner solid borders */}
        <circle cx="70" cy="70" r="59" stroke="#1e3a8a" strokeWidth="1.8" opacity="0.95" />
        <circle cx="70" cy="70" r="41" stroke="#1e3a8a" strokeWidth="1.2" opacity="0.9" />

        {/* Circular curved text path */}
        <path id="circlePathTop" d="M 20,70 A 50,50 0 0,1 120,70" fill="none" />
        <path id="circlePathBottom" d="M 120,70 A 50,50 0 0,1 20,70" fill="none" />

        <text fill="#1e3a8a" fontSize="7.8" fontWeight="bold" letterSpacing="1.2">
          <textPath href="#circlePathTop" startOffset="50%" textAnchor="middle">
            PROFUSE TRANSTECH SOLUTIONS
          </textPath>
        </text>

        <text fill="#1e3a8a" fontSize="7.5" fontWeight="bold" letterSpacing="1.2">
          <textPath href="#circlePathBottom" startOffset="50%" textAnchor="middle">
            ★ PVT. LTD. ★
          </textPath>
        </text>

        {/* Center Text: Bangalore */}
        <text x="70" y="68" textAnchor="middle" fill="#1e3a8a" fontSize="9.5" fontWeight="bold" letterSpacing="0.8">
          Bangalore
        </text>
        <line x1="50" y1="72" x2="90" y2="72" stroke="#1e3a8a" strokeWidth="1" opacity="0.85" />

        {/* Official Authorized Signature (Murali K) - vector-locked onto the stamp */}
        <g transform="rotate(-13 70 70)">
          <text
            x="70"
            y="65"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#0f2b6e"
            style={{
              fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', 'Segoe Script', cursive, serif",
              fontStyle: 'italic',
              fontWeight: 800,
              fontSize: '23px',
              letterSpacing: '0.5px'
            }}
          >
            Murali.k
          </text>
          {/* Authentic Wavy Underline Flourish */}
          <path
            d="M 28,75 Q 38,71 48,75 T 68,75 T 88,75 T 108,75"
            fill="none"
            stroke="#0f2b6e"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}

export function ProfuseSignatoryBlock({ align = 'left', stampSize = 92 }) {
  return (
    <div className={`text-slate-800 font-sans shrink-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p className="font-medium text-slate-700 text-[11.5px] leading-tight">Best Wishes,</p>
      <p className="font-medium text-slate-700 text-[11.5px] leading-tight">Yours Sincerely,</p>
      <div className={`my-1 ${align === 'right' ? 'flex justify-end' : ''}`}>
        <ProfuseStamp size={stampSize} />
      </div>
      <p className="font-bold text-slate-900 text-[11.5px] leading-tight mt-0.5">Manager - Human Resources</p>
      <p className="font-bold text-slate-900 text-[11.5px] leading-tight">Murali K</p>
    </div>
  );
}
