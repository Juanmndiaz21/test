'use client';

import React from 'react';
import Icon from './Icon';

/**
 * Maps heading text to an appropriate semantic Tabler Icon
 */
function getHeadingIcon(title = '') {
    const lower = title.toLowerCase();
    if (lower.includes('flickr') || lower.includes('photo') || lower.includes('album') || lower.includes('picture')) {
        return <Icon name="camera" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
    }
    if (
        lower.includes('service') ||
        lower.includes('compatibility') ||
        lower.includes('detail') ||
        lower.includes('safe') ||
        lower.includes('security') ||
        lower.includes('anti-ban') ||
        lower.includes('guarantee') ||
        lower.includes('account')
    ) {
        return <Icon name="shield-check" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
    }
    if (lower.includes('comment') || lower.includes('review') || lower.includes('rep') || lower.includes('feedback')) {
        return <Icon name="message" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
    }
    if (lower.includes('speed') || lower.includes('fast') || lower.includes('delivery') || lower.includes('instant') || lower.includes('boost')) {
        return <Icon name="bolt" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
    }
    if (lower.includes('car') || lower.includes('vehicle') || lower.includes('drift')) {
        return <Icon name="car" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
    }
    if (lower.includes('weapon') || lower.includes('gun') || lower.includes('tactical')) {
        return <Icon name="target" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
    }
    if (
        lower.includes('package') ||
        lower.includes('item') ||
        lower.includes('aircraft') ||
        lower.includes('role') ||
        lower.includes('rank')
    ) {
        return <Icon name="package" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
    }
    return <Icon name="sparkles" className="w-4 h-4 text-[#9d7cff] shrink-0" stroke={2} />;
}

/**
 * Tabler Checkmark Icon
 */
export function GreenCheckIcon({ className = 'w-4 h-4 text-[#9d7cff]' }) {
    return <Icon name="check-circle" className={className} stroke={2.5} />;
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

        // Check if line is a standalone heading (e.g. "Account Includes:", "Game Access & Compatibility", "Flickr Photo Catalogs:")
        const nextLine = lines[i + 1]?.trim() || '';
        const nextIsChecklist = /^(?:\[[xX✓]\]|✓|✔|☑|- \[[xX✓]\]|-|\*)\s+/.test(nextLine) || /^(?:\[[xX✓]\]|✓|✔|☑)/.test(nextLine);
        const isHeaderPattern =
            /^(?:#{1,4}\s+|[A-Z][A-Za-z0-9\s/&,+-]+:)$/.test(trimmed) ||
            (trimmed.endsWith(':') && trimmed.length < 60) ||
            (nextIsChecklist && trimmed.length < 50 && !trimmed.includes('.') && /^[A-Z]/.test(trimmed));

        if (isHeaderPattern) {
            flushAll();
            const cleanTitle = trimmed.replace(/^#{1,4}\s+/, '').replace(/:$/, '');
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
                        <div key={`h-${idx}`} className="pt-2 first:pt-0">
                            <h4 className="font-['Syne',sans-serif] text-xs sm:text-sm uppercase tracking-wider text-[#9d7cff] font-bold mb-3 flex items-center gap-2">
                                {getHeadingIcon(block.text)}
                                <span>{renderInlineFormatting(block.text)}</span>
                            </h4>
                        </div>
                    );
                }

                if (block.type === 'checklist') {
                    return (
                        <div
                            key={`cl-${idx}`}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-sans my-3"
                        >
                            {block.items.map((item, itemIdx) => (
                                <div
                                    key={itemIdx}
                                    className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <Icon name="check-circle" className="w-4 h-4 sm:w-5 sm:h-5 text-[#9d7cff] shrink-0" stroke={2.5} />
                                    <span className="text-slate-300 font-medium leading-snug">
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
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3"
                        >
                            {block.buttons.map((btn, btnIdx) => (
                                <a
                                    key={btnIdx}
                                    href={btn.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 sm:p-3.5 rounded-xl flex items-center justify-between bg-white/[0.04] border border-white/10 hover:border-[#9d7cff]/50 hover:bg-[#9d7cff]/10 transition-all duration-200 group no-underline shadow-sm cursor-pointer"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {btn.isFlickr ? (
                                            <span className="flex items-center gap-1 shrink-0" aria-hidden="true" title="Flickr Photo Album">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#0063dc] shadow-[0_0_8px_rgba(0,99,220,0.5)]" />
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff0084] shadow-[0_0_8px_rgba(255,0,132,0.5)]" />
                                            </span>
                                        ) : (
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#9d7cff] shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#9d7cff] truncate transition-colors">
                                                {btn.title}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono truncate">
                                                {btn.isFlickr ? 'Flickr Photo Catalog • Live Album' : 'External Showcase'}
                                            </div>
                                        </div>
                                    </div>
                                    <Icon name="arrow-up-right" className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-2 transition-colors" stroke={2} />
                                </a>
                            ))}
                        </div>
                    );
                }

                if (block.type === 'property') {
                    return (
                        <div
                            key={`prop-${idx}`}
                            className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed"
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
                            className="p-3.5 sm:p-4 rounded-xl border border-[#9d7cff]/30 bg-[#9d7cff]/10 text-xs sm:text-sm font-mono text-slate-200 flex items-start gap-2.5 sm:gap-3 my-4 shadow-[0_0_15px_rgba(157,124,255,0.07)]"
                        >
                            <Icon name="info-circle" className="w-4 h-4 text-[#9d7cff] shrink-0 mt-0.5" stroke={2} />
                            <div className="leading-relaxed">
                                <strong className="text-white mr-1.5">{block.prefix}</strong>
                                <span>{renderInlineFormatting(block.text)}</span>
                            </div>
                        </div>
                    );
                }

                return (
                    <p
                        key={`p-${idx}`}
                        className="text-slate-200 text-sm sm:text-base leading-relaxed"
                    >
                        {renderInlineFormatting(block.text)}
                    </p>
                );
            })}
        </div>
    );
}

