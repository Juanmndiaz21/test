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
 * Helper to extract link button metadata from markdown links [Title](url)
 * or labeled URLs like "Title: https://..." or raw URLs.
 */
export function extractLinkButton(rawText) {
    if (!rawText) return null;
    const text = rawText.trim();

    // Check markdown link: [Label](url)
    const mdMatch = text.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/i);
    if (mdMatch) {
        return buildButtonData(mdMatch[1], mdMatch[2]);
    }

    // Check "Label: https://..." or "Label - https://..."
    const labeledMatch = text.match(/^(.+?)(?:\s*[:\-–—]\s*)(https?:\/\/[^\s]+)$/i);
    if (labeledMatch) {
        return buildButtonData(labeledMatch[1], labeledMatch[2]);
    }

    // Check if line contains a URL
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) {
        const url = urlMatch[1];
        const label = text.replace(url, '').replace(/^[:\-–—\s]+|[:\-–—\s]+$/g, '').trim();
        return buildButtonData(label || 'View Link', url);
    }

    return null;
}

function buildButtonData(label, url) {
    const isFlickr = /flic\.kr|flickr\.com/i.test(url);
    const isYoutube = /youtube\.com|youtu\.be/i.test(url);
    const isDiscord = /discord\.(gg|com)/i.test(url);

    let badge = 'External Link';
    if (isFlickr) badge = 'Flickr Catalog';
    else if (isYoutube) badge = 'YouTube Showcase';
    else if (isDiscord) badge = 'Discord Community';

    let cleanTitle = label.trim();
    if (!cleanTitle || cleanTitle.toLowerCase() === 'url' || cleanTitle.toLowerCase() === 'link') {
        cleanTitle = isFlickr ? 'View Photo Catalog' : 'View Link';
    }

    return {
        title: cleanTitle,
        url,
        isFlickr,
        isYoutube,
        isDiscord,
        badge,
    };
}

/**
 * Helper to render simple inline bold (**text**) and clickable inline links
 */
function renderInlineFormatting(text) {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="text-white font-bold">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        const mdLinkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (mdLinkMatch) {
            return (
                <a
                    key={index}
                    href={mdLinkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9d7cff] hover:underline underline-offset-4 inline-flex items-center gap-0.5 font-medium"
                >
                    <span>{mdLinkMatch[1]}</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            );
        }
        if (/^https?:\/\/[^\s]+$/.test(part)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9d7cff] hover:underline underline-offset-4 break-all font-mono text-xs"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}

/**
 * Parses raw text into structured blocks:
 * - headings (e.g. "Account Includes:")
 * - checklists (consecutive lines starting with ✓, [✓], [x], -, *)
 * - buttons (lines with URLs or Flickr catalogs)
 * - notes (lines starting with NOTE:, IMPORTANT:)
 * - paragraphs
 */
export function parseDescriptionBlocks(rawText = '') {
    if (!rawText || !rawText.trim()) return [];

    const lines = rawText.split('\n');
    const blocks = [];
    let currentChecklist = [];
    let currentButtons = [];

    const flushChecklist = () => {
        if (currentChecklist.length > 0) {
            blocks.push({
                type: 'checklist',
                items: [...currentChecklist],
            });
            currentChecklist = [];
        }
    };

    const flushButtons = () => {
        if (currentButtons.length > 0) {
            blocks.push({
                type: 'buttons',
                buttons: [...currentButtons],
            });
            currentButtons = [];
        }
    };

    const flushAll = () => {
        flushChecklist();
        flushButtons();
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Empty line flushes active list & buttons
        if (!trimmed) {
            flushAll();
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

            const linkBtn = extractLinkButton(cleanText);
            if (linkBtn) {
                flushChecklist();
                currentButtons.push(linkBtn);
            } else {
                flushButtons();
                currentChecklist.push(cleanText);
            }
            continue;
        }

        // If not a checklist item:
        // Check if line is a NOTE or callout
        const noteMatch = trimmed.match(/^(?:(?:\*\*NOTE:\*\*|NOTE:|NOTA:|AVISO:|IMPORTANT:|\*\*IMPORTANT:\*\*))\s*(.*)$/i);
        if (noteMatch) {
            flushAll();
            const prefix = trimmed.slice(0, trimmed.indexOf(':') + 1).replace(/\*\*/g, '');
            blocks.push({
                type: 'note',
                prefix: prefix.toUpperCase(),
                text: noteMatch[1].trim(),
            });
            continue;
        }

        // Check if line is a standalone heading (e.g. "Account Includes:", "Flickr Photo Catalogs:")
        const isHeaderPattern =
            /^(?:#{1,4}\s+|[A-Z][A-Za-z0-9\s/&,+-]+:)$/.test(trimmed) ||
            (trimmed.endsWith(':') && trimmed.length < 50);

        if (isHeaderPattern) {
            flushAll();
            const cleanTitle = trimmed.replace(/^#{1,4}\s+/, '');
            blocks.push({
                type: 'heading',
                text: cleanTitle,
            });
            continue;
        }

        // Check if line is a standalone link / button (e.g. "Male Catalog: https://..." or "[View](...)")
        const standaloneBtn = extractLinkButton(trimmed);
        if (standaloneBtn) {
            flushChecklist();
            currentButtons.push(standaloneBtn);
            continue;
        }

        // Check if line starts with a labeled property like "Console: PS4, PS5..."
        const propertyMatch = trimmed.match(/^([A-Za-z0-9\s/&+-]+:)\s+(.+)$/);
        if (propertyMatch && propertyMatch[1].length < 25) {
            flushAll();
            blocks.push({
                type: 'property',
                label: propertyMatch[1],
                value: propertyMatch[2],
            });
            continue;
        }

        // Otherwise it's a regular paragraph
        flushAll();
        blocks.push({
            type: 'paragraph',
            text: trimmed,
        });
    }

    flushAll();
    return blocks;
}

/**
 * ProductDescriptionRenderer
 * Displays product descriptions with 2-column circular checkmarks,
 * interactive photo catalog buttons (Flickr, YouTube, links),
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

                if (block.type === 'buttons') {
                    return (
                        <div
                            key={`btns-${idx}`}
                            className={`grid grid-cols-1 ${block.buttons.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-md'} gap-3 my-3.5`}
                        >
                            {block.buttons.map((btn, btnIdx) => (
                                <a
                                    key={btnIdx}
                                    href={btn.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#171229] hover:bg-[#1f1837] border border-[#9d7cff]/25 hover:border-[#9d7cff] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_26px_rgba(157,124,255,0.22)] hover:-translate-y-0.5 no-underline cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Brand / Type Icon */}
                                        <div className="w-10 h-10 rounded-xl bg-[#120e1c] border border-white/10 group-hover:border-[#9d7cff]/50 flex items-center justify-center shrink-0 transition-colors shadow-inner">
                                            {btn.isFlickr ? (
                                                <span className="flex items-center gap-1" aria-hidden="true" title="Flickr Photo Album">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#0063dc] shadow-[0_0_8px_rgba(0,99,220,0.7)]" />
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff0084] shadow-[0_0_8px_rgba(255,0,132,0.7)]" />
                                                </span>
                                            ) : btn.isYoutube ? (
                                                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-[#9d7cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#9d7cff]">
                                                    {btn.badge}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">• Album</span>
                                            </div>
                                            <div className="text-white text-sm font-bold truncate group-hover:text-[#f1ecfb]">
                                                {btn.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pl-3 shrink-0 text-slate-400 group-hover:text-white transition-colors">
                                        <span className="text-xs font-mono font-medium hidden sm:inline text-slate-400 group-hover:text-[#9d7cff]">
                                            Open
                                        </span>
                                        <svg
                                            className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#9d7cff]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>
                                </a>
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

