'use client';

import React from 'react';

/**
 * Green Circular Checkmark Icon matching the design specification
 */
export function GreenCheckIcon({ className = 'w-3 h-3' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

/**
 * Helper to render simple inline bold (**text**)
 */
function renderInlineFormatting(text) {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="text-white font-bold">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
}

/**
 * Parses raw text into structured blocks:
 * - headings (e.g. "Account Includes:")
 * - checklists (consecutive lines starting with ✓, [✓], [x], -, *)
 * - notes (lines starting with NOTE:, IMPORTANT:)
 * - paragraphs
 */
export function parseDescriptionBlocks(rawText = '') {
    if (!rawText || !rawText.trim()) return [];

    const lines = rawText.split('\n');
    const blocks = [];
    let currentChecklist = [];

    const flushChecklist = () => {
        if (currentChecklist.length > 0) {
            blocks.push({
                type: 'checklist',
                items: [...currentChecklist],
            });
            currentChecklist = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Empty line flushes active list
        if (!trimmed) {
            flushChecklist();
            continue;
        }

        // Check if line is a checklist item
        const isChecklistItem =
            /^(?:\[[xX✓]\]|✓|✔|☑|- \[[xX✓]\]|-|\*)\s+/.test(trimmed) ||
            /^(?:\[[xX✓]\]|✓|✔|☑)/.test(trimmed);

        if (isChecklistItem) {
            const cleanText = trimmed
                .replace(/^(?:-\s*)?\[[xX✓]\]\s*/, '')
                .replace(/^(?:✓|✔|☑)\s*/, '')
                .replace(/^[-*]\s+/, '')
                .trim();
            currentChecklist.push(cleanText);
            continue;
        }

        // If not a checklist item, flush any existing checklist first
        flushChecklist();

        // Check if line is a NOTE or callout
        const noteMatch = trimmed.match(/^(?:(?:\*\*NOTE:\*\*|NOTE:|NOTA:|AVISO:|IMPORTANT:|\*\*IMPORTANT:\*\*))\s*(.*)$/i);
        if (noteMatch) {
            const prefix = trimmed.slice(0, trimmed.indexOf(':') + 1).replace(/\*\*/g, '');
            blocks.push({
                type: 'note',
                prefix: prefix.toUpperCase(),
                text: noteMatch[1].trim(),
            });
            continue;
        }

        // Check if line is a standalone heading (e.g. "Account Includes:", "Console: PS4...")
        const isHeaderPattern =
            /^(?:#{1,4}\s+|[A-Z][A-Za-z0-9\s/&,+-]+:)$/.test(trimmed) ||
            (trimmed.endsWith(':') && trimmed.length < 50);

        if (isHeaderPattern) {
            const cleanTitle = trimmed.replace(/^#{1,4}\s+/, '');
            blocks.push({
                type: 'heading',
                text: cleanTitle,
            });
            continue;
        }

        // Check if line starts with a labeled property like "Console: PS4, PS5..."
        const propertyMatch = trimmed.match(/^([A-Za-z0-9\s/&+-]+:)\s+(.+)$/);
        if (propertyMatch && propertyMatch[1].length < 25) {
            blocks.push({
                type: 'property',
                label: propertyMatch[1],
                value: propertyMatch[2],
            });
            continue;
        }

        // Otherwise it's a regular paragraph
        blocks.push({
            type: 'paragraph',
            text: trimmed,
        });
    }

    flushChecklist();
    return blocks;
}

/**
 * ProductDescriptionRenderer
 * Displays product descriptions with 2-column circular checkmarks,
 * clear headings, labeled console tags, and stylized NOTE callouts.
 */
export default function ProductDescriptionRenderer({ content = '', className = '' }) {
    if (!content) return null;

    const blocks = parseDescriptionBlocks(content);

    return (
        <div className={`space-y-4 text-slate-300 ${className}`}>
            {blocks.map((block, idx) => {
                if (block.type === 'heading') {
                    return (
                        <h3
                            key={`h-${idx}`}
                            className="text-white text-base sm:text-lg font-bold tracking-tight pt-2 first:pt-0"
                        >
                            {renderInlineFormatting(block.text)}
                        </h3>
                    );
                }

                if (block.type === 'checklist') {
                    return (
                        <div
                            key={`cl-${idx}`}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 my-3"
                        >
                            {block.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                                        <GreenCheckIcon className="w-3 h-3 text-emerald-400" />
                                    </span>
                                    <span className="text-white text-sm sm:text-base font-medium leading-snug">
                                        {renderInlineFormatting(item)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (block.type === 'property') {
                    return (
                        <div
                            key={`prop-${idx}`}
                            className="text-slate-200 text-sm sm:text-base font-medium leading-relaxed"
                        >
                            <span className="text-white font-bold">{block.label}</span>{' '}
                            <span>{renderInlineFormatting(block.value)}</span>
                        </div>
                    );
                }

                if (block.type === 'note') {
                    return (
                        <div
                            key={`note-${idx}`}
                            className="text-sm sm:text-base leading-relaxed text-slate-300 pt-1"
                        >
                            <strong className="text-white font-bold tracking-wide mr-1.5">
                                {block.prefix}
                            </strong>
                            <span>{renderInlineFormatting(block.text)}</span>
                        </div>
                    );
                }

                return (
                    <p
                        key={`p-${idx}`}
                        className="text-slate-300 text-sm sm:text-base leading-relaxed"
                    >
                        {renderInlineFormatting(block.text)}
                    </p>
                );
            })}
        </div>
    );
}
