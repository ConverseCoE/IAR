import React from 'react';

// Default standard violation items matching official Johnson & Johnson IAPP specification
export const DEFAULT_IAPP_VIOLATIONS = [
  {
    number: '1',
    linkText: 'S-15 Section No. [2]',
    title: 'Security Assessment for COTS Systems/Applications',
    detail: 'Security assessment not completed for the environment'
  },
  {
    number: '2',
    linkText: 'S-15 Section No. [11]',
    title: 'ISRM Approval Prior to Production',
    detail: 'ISRM approval lacking due to missing assessment'
  },
  {
    number: '3',
    linkText: 'S-15 Section No. [4.18]',
    title: 'Periodic Application Architecture/Code/Config Assessment',
    detail: 'No periodic assessment of architecture, code, configuration'
  }
];

export const DEFAULT_IAPP_SUBTITLE = 'Non-Compliant with some of the sections of IAPP:';

/**
 * Parses raw text containing a main finding description and an optional
 * "Violation Reference" section with numbered IAPP/regulatory citations.
 */
export function parseDescriptionWithViolations(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return {
      mainText: '',
      hasViolations: true,
      subTitle: DEFAULT_IAPP_SUBTITLE,
      items: DEFAULT_IAPP_VIOLATIONS
    };
  }

  // Normalize text: replace literal "\u2014" or multiple dashes
  const normalized = rawText.replace(/\\u2014/g, '—');

  // Look for "Violation Reference" marker
  const violationMarker = /Violation Reference/i;
  const matchIdx = normalized.search(violationMarker);

  if (matchIdx === -1) {
    // Check if it starts with "Non-Compliant with" directly
    const ncMarker = /Non-Compliant with/i;
    const ncIdx = normalized.search(ncMarker);
    if (ncIdx !== -1) {
      const mainText = normalized.slice(0, ncIdx).trim();
      const violationPart = normalized.slice(ncIdx).trim();
      return parseViolationLines(mainText, violationPart);
    }
    // If no violation section in text, use main text with default IAPP violations
    return {
      mainText: normalized,
      hasViolations: true,
      subTitle: DEFAULT_IAPP_SUBTITLE,
      items: DEFAULT_IAPP_VIOLATIONS
    };
  }

  const mainText = normalized.slice(0, matchIdx).trim();
  const violationPart = normalized.slice(matchIdx + 'Violation Reference'.length).trim();
  return parseViolationLines(mainText, violationPart);
}

function parseViolationLines(mainText, violationPart) {
  const lines = violationPart.split('\n').map(l => l.trim()).filter(Boolean);
  let subTitle = DEFAULT_IAPP_SUBTITLE;
  const items = [];

  for (const line of lines) {
    // Check if line is the subtitle heading
    if (/^Non-Compliant with/i.test(line)) {
      subTitle = line;
      continue;
    }

    // Match numbered items like "1. S-15 Section No. [2] - ... — ..."
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/);
    if (numMatch) {
      const number = numMatch[1];
      const rest = numMatch[2].trim();

      // Split by "-" or "—" to isolate the link text, title, and detail
      const dashParts = rest.split(/\s*[-—]\s*/);
      if (dashParts.length >= 2) {
        const linkText = dashParts[0].trim();
        const title = dashParts[1]?.trim() || '';
        const detail = dashParts.slice(2).join(' — ').trim() || '';
        items.push({
          number,
          linkText,
          title,
          detail,
          raw: line
        });
      } else {
        items.push({
          number,
          linkText: rest,
          title: '',
          detail: '',
          raw: line
        });
      }
    } else if (/Section No|STND/i.test(line)) {
      // Unnumbered section line
      const dashParts = line.split(/\s*[-—]\s*/);
      items.push({
        number: `${items.length + 1}`,
        linkText: dashParts[0].trim(),
        title: dashParts[1]?.trim() || '',
        detail: dashParts.slice(2).join(' — ').trim() || '',
        raw: line
      });
    }
  }

  return {
    mainText,
    hasViolations: true,
    subTitle: subTitle || DEFAULT_IAPP_SUBTITLE,
    items: items.length > 0 ? items : DEFAULT_IAPP_VIOLATIONS
  };
}

export default function DescriptionWithViolations({
  value = '',
  onChange,
  isReadOnly = false,
  onOpenViolationDoc,
  label = 'Description',
  commentTrigger = null
}) {
  const parsed = parseDescriptionWithViolations(value);
  const items = parsed.items && parsed.items.length > 0 ? parsed.items : DEFAULT_IAPP_VIOLATIONS;
  const subTitle = parsed.subTitle || DEFAULT_IAPP_SUBTITLE;
  const mainText = parsed.mainText || value || '';

  const handleLinkClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenViolationDoc) {
      onOpenViolationDoc(item);
    }
  };

  const handleTextChange = (newMainText) => {
    if (!onChange) return;
    const fullText = `${newMainText}\n\nViolation Reference\n${subTitle}\n${items.map(it => `${it.number}. ${it.linkText} - ${it.title}${it.detail ? ` — ${it.detail}` : ''}`).join('\n')}`;
    onChange(fullText);
  };

  return (
    <div>
      {/* Field Label Header Row: ONLY label on left, lock/comment trigger on right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', margin: 0 }}>
          {label}
        </label>

        {/* Right side: Comment Trigger and Read-Only lock badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isReadOnly && (
            <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '700' }}>
              🔒 Read Only
            </span>
          )}
          {commentTrigger}
        </div>
      </div>

      {/* Main Container matching user's design image verbatim */}
      <div
        style={{
          border: '1.5px solid #CBD5E1',
          borderRadius: '24px', // Signature large pill rounded corners from screenshot
          padding: '22px 28px',
          backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
          transition: 'border-color 0.15s ease',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
      >
        {/* Main Description Observation Text (Directly editable if not read-only) */}
        {isReadOnly ? (
          <div style={{
            fontSize: '12.8px',
            color: '#0F172A',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            marginBottom: '16px'
          }}>
            {mainText || 'No description recorded.'}
          </div>
        ) : (
          <textarea
            rows={Math.max(2, (mainText || '').split('\n').length)}
            value={mainText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter issue description..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              fontSize: '12.8px',
              color: '#0F172A',
              lineHeight: '1.6',
              resize: 'vertical',
              padding: 0,
              margin: 0,
              marginBottom: '16px'
            }}
          />
        )}

        {/* Violation Reference Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '14px'
        }}>
          {/* Bold Section Title */}
          <div style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: '-0.1px'
          }}>
            Violation Reference
          </div>

          {/* Subheading */}
          <div style={{
            fontSize: '12.5px',
            color: '#334155',
            marginBottom: '4px'
          }}>
            {subTitle}
          </div>

          {/* Numbered Violation Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  fontSize: '12.5px',
                  lineHeight: '1.55',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '4px'
                }}
              >
                <span style={{ fontWeight: '600', minWidth: '16px' }}>{item.number}.</span>
                <div>
                  {/* Clickable Violation Reference Link */}
                  <span
                    onClick={(e) => handleLinkClick(e, item)}
                    style={{
                      color: '#1D4ED8',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'color 0.12s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#1E40AF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#1D4ED8'; }}
                    title="Click to view official IAPP PDF Document in side drawer"
                  >
                    {item.linkText}
                  </span>

                  {/* Title & Detail */}
                  {item.title && (
                    <span style={{ color: '#0F172A' }}>
                      {' '}- {item.title}
                    </span>
                  )}
                  {item.detail && (
                    <span style={{ color: '#334155' }}>
                      {' '}— {item.detail}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
