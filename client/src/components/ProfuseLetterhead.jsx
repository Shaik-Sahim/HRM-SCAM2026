import React from 'react';
import { MARGEY_LOGO_DATA_URI, MARGEY_STAMP_DATA_URI, MARGEY_SIGNATURE_DATA_URI } from '../assets/logoDataUri';

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

export function ProfuseStamp({ size = 78, showStamp = false, showSignature = true }) {
  if (!showStamp && !showSignature) return null;

  // When stamp is disabled: show signature with tight, crisp natural proportions sitting right above the line
  if (!showStamp && showSignature) {
    return (
      <div className="relative select-none pointer-events-none inline-flex items-end">
        <img
          src={MARGEY_SIGNATURE_DATA_URI}
          alt="Authorized Signatory"
          className="h-11 w-auto max-w-[180px] object-contain object-bottom block"
        />
      </div>
    );
  }

  // When stamp is enabled: official circular rubber stamp with signature overlaid across it
  const stampPx = Math.max(68, Math.min(84, size));
  return (
    <div 
      className="relative select-none pointer-events-none inline-block"
      style={{ 
        width: `${stampPx}px`, 
        height: `${stampPx}px`, 
        minWidth: `${stampPx}px`, 
        minHeight: `${stampPx}px`, 
        maxWidth: `${stampPx}px`, 
        maxHeight: `${stampPx}px`,
        position: 'relative'
      }}
    >
      {/* Official Circular Margey Labs Rubber Stamp Image */}
      {showStamp && (
        <img 
          src={MARGEY_STAMP_DATA_URI} 
          alt="MARGEY LABS PVT. LTD. Stamp" 
          style={{ 
            width: `${stampPx}px`, 
            height: `${stampPx}px`, 
            display: 'block',
            objectFit: 'contain'
          }} 
        />
      )}

      {/* Official Authorized Signature (MD. Vartulla Baig) positioned across the stamp */}
      {showSignature && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: 'rotate(-5deg)' }}
        >
          <img
            src={MARGEY_SIGNATURE_DATA_URI}
            alt="Authorized Signatory"
            style={{
              width: `${Math.round(stampPx * 1.15)}px`,
              maxWidth: `${Math.round(stampPx * 1.15)}px`,
              height: 'auto',
              display: 'block',
              objectFit: 'contain'
            }}
          />
        </div>
      )}
    </div>
  );
}

export const MargeyStamp = ProfuseStamp;

export function ProfuseSignatoryBlock({ align = 'left', showStamp = false, showSignature = true, stampSize = 78 }) {
  return (
    <div className={`text-slate-800 font-sans shrink-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p className="font-medium text-slate-700 text-[11px] leading-tight">Yours Sincerely,</p>
      <p className="font-bold text-slate-900 text-[11.5px] leading-tight mt-0.5">For MARGEY LABS PRIVATE LIMITED</p>
      <div className={`${showStamp ? 'h-20' : 'h-12'} flex items-end pb-1 ${align === 'right' ? 'justify-end' : ''}`}>
        <ProfuseStamp size={stampSize} showStamp={showStamp} showSignature={showSignature} />
      </div>
      <div className={`pt-1 border-t border-slate-500 w-56 ${align === 'right' ? 'ml-auto' : ''}`}>
        <p className="font-bold text-slate-900 text-[11px] leading-tight">Authorized Signatory</p>
        <p className="font-medium text-slate-600 text-[10px] leading-tight mt-0.5">Human Resources Department</p>
      </div>
    </div>
  );
}

export const MargeySignatoryBlock = ProfuseSignatoryBlock;
