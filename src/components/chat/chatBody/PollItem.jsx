'use client';

import { useMemo } from 'react';
import { FaPollH } from 'react-icons/fa';

export default function PollItem({ poll, isMobile = false }) {
  const data = poll || {};
  const question = data.question || 'Sondage';
  const options = Array.isArray(data.options) ? data.options : [];
  const totalVotes =
    typeof data.total_votes === 'number' ? data.total_votes : null;
  const allowMultiple = !!data.allow_multiple;

  const subtitle = useMemo(() => {
    const parts = [];
    if (allowMultiple) parts.push('Choix multiples');
    if (totalVotes != null)
      parts.push(`${totalVotes} vote${totalVotes > 1 ? 's' : ''}`);
    return parts.join(' • ');
  }, [allowMultiple, totalVotes]);

  return (
    <div
      className={`w-[320px] overflow-hidden rounded-lg ${
        isMobile ? 'max-w-[260px]' : ''
      }`}
    >
      <div
        className="px-4 py-3"
        style={{ backgroundColor: 'var(--wa-panel-header)' }}
        role="group"
        aria-label="Sondage"
      >
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-[2px]">
            <FaPollH size={18} style={{ color: 'var(--wa-highlight)' }} />
          </div>
          <div className="min-w-0">
            <div
              className="text-[14px] font-semibold leading-snug"
              style={{ color: 'var(--wa-primary-strong)' }}
            >
              {question}
            </div>
            {subtitle && (
              <div
                className="text-[11px] mt-0.5"
                style={{ color: 'var(--wa-secondary)' }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 bg-neutral-900/20">
        {options.length ? (
          <div className="flex flex-col gap-1.5">
            {options.map((opt, idx) => (
              <div
                key={`${idx}-${String(opt)}`}
                className="px-3 py-2 rounded-md text-[13px]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--wa-primary-strong)',
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[13px]" style={{ color: 'var(--wa-secondary)' }}>
            Aucune option
          </div>
        )}
      </div>
    </div>
  );
}
