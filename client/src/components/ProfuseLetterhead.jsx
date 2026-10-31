import React from 'react';
import { MARGEY_LOGO_DATA_URI, MARGEY_STAMP_DATA_URI } from '../assets/logoDataUri';

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
                {dateStr.startsWith('Dated:') || dateStr.startsWith('Date:') ? dateStr : `Dated: ${dateStr}`}
              </p>
            )}
          </div>
        )}
      </div>
      {refId && (
        <div className="mt-2 text-[11.5px] font-bold text-slate-900 font-sans">
          Emp Ref : <span className="font-sans font-bold">{refId}</span>
        </div>
      )}
    </div>
  );
}

export const MargeyHeader = ProfuseHeader;

export function ProfuseFooter() {
  return (
    <div 
      className="w-full pt-2 mt-auto text-center border-t-2 border-[#548DD4] select-none shrink-0"
      style={{ fontFamily: "'Cambria', 'Georgia', 'Times New Roman', serif" }}
    >
      <p className="text-[10px] text-[#595959] leading-[1.4] text-center">
        <strong className="font-bold text-[#333333]">MARGEY LABS PVT. LTD.</strong> | CIN: U58200KA2024PTC191015 | 4th Floor, GR Arcade, Marathahalli,
      </p>
      <p className="text-[10px] text-[#595959] leading-[1.4] text-center">
        Bengaluru – 560037 | +91 86608 03099 | +91 9100588005 |
      </p>
      <p className="text-[10px] text-[#595959] leading-[1.4] text-center">
        info@margeylabs.com | margeylabs.com
      </p>
    </div>
  );
}

export const MargeyFooter = ProfuseFooter;

export function ProfuseStamp({ size = 94 }) {
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
      {/* Official Circular Margey Labs Rubber Stamp Image with authentic ink blend */}
      <img 
        src={MARGEY_STAMP_DATA_URI} 
        alt="MARGEY LABS PVT. LTD. Stamp" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          minWidth: `${size}px`, 
          minHeight: `${size}px`, 
          maxWidth: `${size}px`, 
          maxHeight: `${size}px`,
          display: 'block',
          mixBlendMode: 'multiply',
          objectFit: 'contain'
        }} 
      />

      {/* Official Authorized HR Signature (Murali K) vector-aligned across the stamp */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ transform: 'rotate(-12deg)' }}
      >
        <span
          style={{
            fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', 'Segoe Script', cursive, serif",
            fontStyle: 'italic',
            fontWeight: 800,
            fontSize: `${size * 0.27}px`,
            letterSpacing: '0.5px',
            color: '#082f49',
            display: 'block',
            lineHeight: 1
          }}
        >
          Murali.k
        </span>
        <svg width={size * 0.72} height={size * 0.14} viewBox="0 0 100 20" fill="none" className="mx-auto -mt-0.5">
          <path
            d="M 5,10 Q 20,4 35,10 T 65,10 T 95,10"
            stroke="#082f49"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.95"
          />
        </svg>
      </div>
    </div>
  );
}

export const MargeyStamp = ProfuseStamp;

export function ProfuseSignatoryBlock({ align = 'left', showStamp = true, stampSize = 92 }) {
  return (
    <div className={`text-slate-800 font-sans shrink-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p className="font-medium text-slate-700 text-[11px] leading-tight">Yours Sincerely,</p>
      <p className="font-bold text-slate-900 text-[11.5px] leading-tight mt-0.5">For MARGEY LABS PRIVATE LIMITED</p>
      {showStamp ? (
        <div className={`my-1.5 ${align === 'right' ? 'flex justify-end' : ''}`}>
          <ProfuseStamp size={stampSize} />
        </div>
      ) : null}
      <div className={`pt-1 border-t border-slate-400 w-52 ${align === 'right' ? 'ml-auto' : ''}`}>
        <p className="font-bold text-slate-900 text-[10.5px] leading-tight">Authorized Signatory</p>
        <p className="font-medium text-slate-600 text-[10px] leading-tight">Human Resources Department</p>
      </div>
    </div>
  );
}

export const MargeySignatoryBlock = ProfuseSignatoryBlock;
