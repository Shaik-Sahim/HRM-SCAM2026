import React from 'react';
import { MARGEY_LOGO_DATA_URI } from '../assets/logoDataUri';

export function ProfuseLogo({ size = 42, height }) {
  const h = height || size;
  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src={MARGEY_LOGO_DATA_URI}
        alt="Margey Labs Pvt Ltd"
        style={{ height: `${h}px`, width: 'auto', display: 'block', maxWidth: '240px' }}
        className="object-contain"
      />
    </div>
  );
}

export const MargeyLogo = ProfuseLogo;

export function ProfuseHeader({ refId, dateStr, isConfidential = true }) {
  return (
    <div className="w-full mb-3 shrink-0">
      <div className="flex justify-between items-start">
        <ProfuseLogo height={42} />
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

export const MargeyHeader = ProfuseHeader;

export function ProfuseFooter() {
  return (
    <div className="w-full pt-2 mt-auto text-center border-t border-slate-200 select-none shrink-0 font-sans">
      <h3 className="text-xs font-extrabold uppercase tracking-wide text-cyan-600 font-sans">
        MARGEY LABS PVT. LTD.
      </h3>
      <p className="text-[9.5px] text-slate-700 font-medium mt-0.5 font-sans">
        4th Floor, GR Arcade, Marathahalli, Bengaluru – 560037
      </p>
      <p className="text-[9.5px] text-slate-600 font-mono mt-0.5">
        CIN: U58200KA2024PTC191015 &nbsp;|&nbsp; Phone: +91 86608 03099, +91 9100588005 &nbsp;|&nbsp; Email: info@margeylabs.com &nbsp;|&nbsp; margeylabs.com
      </p>
    </div>
  );
}

export const MargeyFooter = ProfuseFooter;

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
        <circle cx="70" cy="70" r="65" stroke="#0284c7" strokeWidth="2.2" strokeDasharray="3 2" opacity="0.95" />
        {/* Inner solid borders */}
        <circle cx="70" cy="70" r="59" stroke="#0369a1" strokeWidth="1.8" opacity="0.95" />
        <circle cx="70" cy="70" r="41" stroke="#0284c7" strokeWidth="1.2" opacity="0.9" />

        {/* Circular curved text path */}
        <path id="circlePathTop" d="M 20,70 A 50,50 0 0,1 120,70" fill="none" />
        <path id="circlePathBottom" d="M 120,70 A 50,50 0 0,1 20,70" fill="none" />

        <text fill="#0369a1" fontSize="8.2" fontWeight="bold" letterSpacing="1.2">
          <textPath href="#circlePathTop" startOffset="50%" textAnchor="middle">
            MARGEY LABS PVT. LTD.
          </textPath>
        </text>

        <text fill="#0369a1" fontSize="7.8" fontWeight="bold" letterSpacing="1.2">
          <textPath href="#circlePathBottom" startOffset="50%" textAnchor="middle">
            ★ BANGALORE ★
          </textPath>
        </text>

        {/* Center Text: Bangalore */}
        <text x="70" y="68" textAnchor="middle" fill="#0284c7" fontSize="9.5" fontWeight="bold" letterSpacing="0.8">
          Bangalore
        </text>
        <line x1="50" y1="72" x2="90" y2="72" stroke="#0284c7" strokeWidth="1" opacity="0.85" />

        {/* Official Authorized Signature (Murali K) - vector-locked onto the stamp */}
        <g transform="rotate(-13 70 70)">
          <text
            x="70"
            y="65"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#082f49"
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
            stroke="#082f49"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}

export const MargeyStamp = ProfuseStamp;

export function ProfuseSignatoryBlock({ align = 'left', stampSize = 92 }) {
  return (
    <div className={`text-slate-800 font-sans shrink-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p className="font-medium text-slate-700 text-[11.5px] leading-tight">Best Wishes,</p>
      <p className="font-medium text-slate-700 text-[11.5px] leading-tight">Yours Sincerely,</p>
      <p className="font-bold text-slate-900 text-[11.5px] leading-tight mt-0.5">For Margey Labs Pvt Limited</p>
      <div className={`my-1 ${align === 'right' ? 'flex justify-end' : ''}`}>
        <ProfuseStamp size={stampSize} />
      </div>
      <p className="font-bold text-slate-900 text-[11.5px] leading-tight mt-0.5">Manager - Human Resources</p>
      <p className="font-bold text-slate-900 text-[11.5px] leading-tight">Murali K</p>
    </div>
  );
}

export const MargeySignatoryBlock = ProfuseSignatoryBlock;
