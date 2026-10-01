import React from 'react';

export function slugifyHeading(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export function calculateWordCount(content) {
    if (!content) return 0;
    const clean = content.replace(/[#*`_\[\]()>-]/g, ' ');
    const words = clean.trim().split(/\s+/).filter(Boolean);
    return words.length;
}

export function extractHeadings(content) {
    if (!content) return [];
    const lines = content.split('\n');
    const headings = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.startsWith('## ') && !line.startsWith('### ')) {
            const title = line.replace(/^##\s+/, '').trim();
            headings.push({
                level: 2,
                title,
                id: slugifyHeading(title)
            });
        } else if (line.startsWith('### ')) {
            const title = line.replace(/^###\s+/, '').trim();
            headings.push({
                level: 3,
                title,
                id: slugifyHeading(title)
            });
        }
    }

    return headings;
}

export function extractFaqItems(content) {
    if (!content) return [];
    const lines = content.split('\n');
    const faqs = [];
    let inFaq = false;
    let currentQuestion = null;
    let currentAnswer = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (/^##\s+(FAQ|Frequently Asked Questions)/i.test(line)) {
            inFaq = true;
            continue;
        }

        if (inFaq) {
            // Next H2 ends FAQ section
            if (line.startsWith('## ') && !line.startsWith('### ')) {
                if (currentQuestion && currentAnswer.length > 0) {
                    faqs.push({
                        question: currentQuestion,
                        answer: currentAnswer.join(' ').trim()
                    });
                }
                break;
            }

            if (line.startsWith('### ')) {
                if (currentQuestion && currentAnswer.length > 0) {
                    faqs.push({
                        question: currentQuestion,
                        answer: currentAnswer.join(' ').trim()
                    });
                }
                currentQuestion = line.replace(/^###\s+/, '').trim();
                currentAnswer = [];
            } else if (currentQuestion && line && !line.startsWith('#')) {
                currentAnswer.push(line.replace(/[*_`]/g, ''));
            }
        }
    }

    if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
            question: currentQuestion,
            answer: currentAnswer.join(' ').trim()
        });
    }

    return faqs;
}

function renderInline(text) {
    if (!text) return '';

    const tokens = [];
    let remaining = text;
    let key = 0;

    while (remaining) {
        // Bold: **text**
        const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
        if (boldMatch) {
            tokens.push(
                <strong key={key++} className="font-bold text-white">
                    {boldMatch[2]}
                </strong>
            );
            remaining = remaining.slice(boldMatch[0].length);
            continue;
        }

        // Inline Code: `code`
        const codeMatch = remaining.match(/^`([^`]+)`/);
        if (codeMatch) {
            tokens.push(
                <code
                    key={key++}
                    className="px-1.5 py-0.5 rounded bg-white/10 text-[#c084fc] font-mono text-[0.9em]"
                >
                    {codeMatch[1]}
                </code>
            );
            remaining = remaining.slice(codeMatch[0].length);
            continue;
        }

        // Images: ![alt](url)
        const imageMatch = remaining.match(/^!\[(.*?)\]\((.*?)\)/);
        if (imageMatch) {
            tokens.push(
                <figure key={key++} className="my-6 block rounded-2xl overflow-hidden border border-white/10 bg-[#120e1c] shadow-lg">
                    <img
                        src={imageMatch[2]}
                        alt={imageMatch[1] || 'Blog visual'}
                        className="w-full max-h-[500px] object-cover"
                        loading="lazy"
                    />
                    {imageMatch[1] && (
                        <figcaption className="p-2.5 text-center text-xs text-slate-400 bg-[#161126] border-t border-white/5 font-mono">
                            {imageMatch[1]}
                        </figcaption>
                    )}
                </figure>
            );
            remaining = remaining.slice(imageMatch[0].length);
            continue;
        }

        // Links: [text](url)
        const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
            tokens.push(
                <a
                    key={key++}
                    href={linkMatch[2]}
                    target={linkMatch[2].startsWith('http') ? '_blank' : undefined}
                    rel={linkMatch[2].startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-[#9d7cff] hover:underline underline-offset-4 font-semibold"
                >
                    {linkMatch[1]}
                </a>
            );
            remaining = remaining.slice(linkMatch[0].length);
            continue;
        }

        const nextSpecial = remaining.search(/[\*\_`\[!]/);
        if (nextSpecial === -1) {
            tokens.push(remaining);
            break;
        } else if (nextSpecial === 0) {
            tokens.push(remaining[0]);
            remaining = remaining.slice(1);
        } else {
            tokens.push(remaining.slice(0, nextSpecial));
            remaining = remaining.slice(nextSpecial);
        }
    }

    return tokens;
}

export default function BlogMarkdown({ content }) {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let key = 0;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Blank line
        if (!trimmed) {
            i++;
            continue;
        }

        // Horizontal rule: --- or ***
        if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
            elements.push(<hr key={key++} className="border-white/10 my-8" />);
            i++;
            continue;
        }

        // Image block: ![alt](url)
        const standaloneImageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (standaloneImageMatch) {
            const alt = standaloneImageMatch[1];
            const src = standaloneImageMatch[2];
            elements.push(
                <figure key={key++} className="my-8 rounded-2xl overflow-hidden border border-white/10 bg-[#120e1c] shadow-xl">
                    <img
                        src={src}
                        alt={alt || 'Article visual'}
                        className="w-full max-h-[550px] object-cover"
                        loading="lazy"
                    />
                    {alt && (
                        <figcaption className="p-3 text-center text-xs font-mono text-slate-400 bg-[#161126] border-t border-white/5">
                            {alt}
                        </figcaption>
                    )}
                </figure>
            );
            i++;
            continue;
        }

        // Fenced Code Block or Visual Diagram: ```lang ... ```
        if (trimmed.startsWith('```')) {
            const lang = trimmed.replace(/^```/, '').trim().toLowerCase();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            if (i < lines.length && lines[i].trim().startsWith('```')) {
                i++; // skip closing backticks
            }

            if (lang === 'diagram' || lang === 'flow' || lang === 'steps') {
                const stepIcons = [
                    // Step 1: Globe / Download
                    (
                        <svg className="w-5 h-5 text-[#9d7cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    ),
                    // Step 2: User / Credentials
                    (
                        <svg className="w-5 h-5 text-[#9d7cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ),
                    // Step 3: Calendar / Birthday / Verification
                    (
                        <svg className="w-5 h-5 text-[#9d7cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    ),
                    // Step 4: Mail / Confirmation
                    (
                        <svg className="w-5 h-5 text-[#9d7cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    ),
                    // Step 5: Shield / Security / 2FA
                    (
                        <svg className="w-5 h-5 text-[#9d7cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    ),
                    // Step 6: Gamepad / Community
                    (
                        <svg className="w-5 h-5 text-[#9d7cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                ];

                const parsedSteps = codeLines
                    .filter((l) => l.trim())
                    .map((l) => {
                        const parts = l.split('|').map((p) => p.trim());
                        const cleanTitle = (parts[0] || '').replace(/^\d+[\.\)]\s*/, '');
                        return {
                            title: cleanTitle,
                            description: parts[1] || '',
                            subtext: parts[2] || ''
                        };
                    });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-[#9d7cff]/40 shadow-[0_12px_40px_rgba(157,124,255,0.12)] p-6 sm:p-8">
                        {/* Header Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#9d7cff]/20 border border-[#9d7cff]/40 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#c084fc]">
                                            Visual Process Diagram
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black text-white tracking-tight mt-0.5">
                                        Step-by-Step Account Creation Pipeline
                                    </h4>
                                </div>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 self-start sm:self-auto">
                                {parsedSteps.length} Sequential Steps
                            </span>
                        </div>

                        {/* Interactive Step Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {parsedSteps.map((step, sIdx) => {
                                const icon = stepIcons[sIdx % stepIcons.length];
                                return (
                                    <div
                                        key={sIdx}
                                        className="relative rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#9d7cff]/50 transition-all duration-200 p-5 flex flex-col justify-between group shadow-sm"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#9d7cff]/10 border border-[#9d7cff]/30 flex items-center justify-center">
                                                    {icon}
                                                </div>
                                                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#9d7cff]/20 text-[#c084fc] border border-[#9d7cff]/30">
                                                    STEP 0{sIdx + 1}
                                                </span>
                                            </div>
                                            <h5 className="font-bold text-white text-base group-hover:text-[#c084fc] transition-colors leading-snug">
                                                {step.title}
                                            </h5>
                                            {step.description && (
                                                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                                                    {step.description}
                                                </p>
                                            )}
                                        </div>
                                        {step.subtext && (
                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                                                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    {step.subtext}
                                                </span>
                                                {sIdx < parsedSteps.length - 1 && (
                                                    <span className="text-slate-500 hidden lg:inline font-mono">
                                                        ➔
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else {
                // High-polish terminal code / schematic block
                elements.push(
                    <div key={key++} className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0c0816] shadow-xl">
                        {/* Terminal title bar with macOS-like dots */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#140e24] border-b border-white/5">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                                <span className="ml-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                    {lang || 'Flowchart Architecture'}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">ASCII Architecture</span>
                        </div>
                        <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300/90 leading-relaxed scrollbar-thin">
                            <code>{codeLines.join('\n')}</code>
                        </pre>
                    </div>
                );
            }
            continue;
        }

        // Heading 1: # Title
        if (trimmed.startsWith('# ')) {
            const rawTitle = trimmed.replace(/^#\s+/, '');
            elements.push(
                <h1 key={key++} className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-8 mb-4 tracking-tight">
                    {renderInline(rawTitle)}
                </h1>
            );
            i++;
            continue;
        }

        // Heading 2: ## Section
        if (trimmed.startsWith('## ')) {
            const rawTitle = trimmed.replace(/^##\s+/, '');
            const headingId = slugifyHeading(rawTitle);
            const isQuickInfo = /quick\s*info|key\s*takeaways/i.test(rawTitle);

            elements.push(
                <h2
                    key={key++}
                    id={headingId}
                    className="text-xl sm:text-2xl font-bold text-white mt-10 mb-4 tracking-tight flex items-center gap-2.5 scroll-mt-28 group"
                >
                    <span className="w-1.5 h-6 bg-[#9d7cff] rounded-full inline-block group-hover:scale-y-110 transition-transform" />
                    <span>{renderInline(rawTitle)}</span>
                    <a
                        href={`#${headingId}`}
                        aria-label={`Link to ${rawTitle}`}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#9d7cff] text-sm ml-1 transition-opacity"
                    >
                        #
                    </a>
                </h2>
            );
            i++;
            continue;
        }

        // Heading 3: ### Subsection
        if (trimmed.startsWith('### ')) {
            const rawTitle = trimmed.replace(/^###\s+/, '');
            const headingId = slugifyHeading(rawTitle);
            elements.push(
                <h3
                    key={key++}
                    id={headingId}
                    className="text-lg sm:text-xl font-bold text-[#c084fc] mt-6 mb-2.5 scroll-mt-28 group flex items-center gap-2"
                >
                    <span>{renderInline(rawTitle)}</span>
                    <a
                        href={`#${headingId}`}
                        aria-label={`Link to ${rawTitle}`}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#9d7cff] text-xs transition-opacity"
                    >
                        #
                    </a>
                </h3>
            );
            i++;
            continue;
        }

        // Blockquote: > Quote
        if (trimmed.startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
                i++;
            }
            elements.push(
                <blockquote
                    key={key++}
                    className="border-l-4 border-[#9d7cff] bg-[#161126]/80 p-4 sm:p-5 rounded-r-xl my-6 text-slate-300 italic text-base leading-relaxed"
                >
                    {quoteLines.map((ql, qIdx) => (
                        <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
                            {renderInline(ql)}
                        </p>
                    ))}
                </blockquote>
            );
            continue;
        }

        // Unordered list: * or -
        if (/^[\*\-]\s+/.test(trimmed)) {
            const listItems = [];
            while (i < lines.length && /^[\*\-]\s+/.test(lines[i].trim())) {
                listItems.push(lines[i].trim().replace(/^[\*\-]\s+/, ''));
                i++;
            }
            elements.push(
                <ul key={key++} className="space-y-2.5 my-4 list-none pl-1">
                    {listItems.map((item, lIdx) => (
                        <li key={lIdx} className="flex items-start gap-3 text-slate-300 text-base leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#9d7cff] shrink-0 mt-2.5" />
                            <span>{renderInline(item)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Numbered list: 1. 2. 3.
        if (/^\d+\.\s+/.test(trimmed)) {
            const listItems = [];
            let counter = 1;
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
                listItems.push({
                    number: counter++,
                    text: lines[i].trim().replace(/^\d+\.\s+/, '')
                });
                i++;
            }
            elements.push(
                <ol key={key++} className="space-y-2.5 my-4 list-none pl-1">
                    {listItems.map((item, lIdx) => (
                        <li key={lIdx} className="flex items-start gap-3 text-slate-300 text-base leading-relaxed">
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono font-bold text-[#c084fc] shrink-0 mt-0.5">
                                {item.number}
                            </span>
                            <span>{renderInline(item.text)}</span>
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        // Markdown Table: | Col 1 | Col 2 |
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
                tableLines.push(lines[i].trim());
                i++;
            }

            if (tableLines.length >= 2) {
                const parseRow = (rowStr) =>
                    rowStr
                        .slice(1, -1)
                        .split('|')
                        .map((c) => c.trim());

                const headers = parseRow(tableLines[0]);
                const bodyRows = tableLines.slice(1).filter((r) => !/^[\|\-\s:]+$/.test(r)).map(parseRow);

                elements.push(
                    <div key={key++} className="overflow-x-auto my-6 rounded-2xl border border-white/10 panel-surface shadow-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#171229] border-b border-white/10 font-bold text-white font-mono text-xs uppercase tracking-wider">
                                <tr>
                                    {headers.map((h, hIdx) => (
                                        <th key={hIdx} className="py-3.5 px-4 text-slate-200">
                                            {renderInline(h)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-300">
                                {bodyRows.map((cols, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                                        {cols.map((col, cIdx) => (
                                            <td key={cIdx} className="py-3.5 px-4">
                                                {renderInline(col)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                continue;
            }
        }

        // Paragraph: collect lines
        const paragraphLines = [];
        while (
            i < lines.length &&
            lines[i].trim() &&
            !lines[i].trim().startsWith('#') &&
            !lines[i].trim().startsWith('>') &&
            !lines[i].trim().startsWith('```') &&
            !lines[i].trim().startsWith('![') &&
            !/^[\*\-]\s+/.test(lines[i].trim()) &&
            !/^\d+\.\s+/.test(lines[i].trim()) &&
            !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) &&
            !/^(\-{3,}|\*{3,})$/.test(lines[i].trim())
        ) {
            paragraphLines.push(lines[i].trim());
            i++;
        }

        if (paragraphLines.length > 0) {
            elements.push(
                <p key={key++} className="text-slate-300 text-base sm:text-[17px] leading-relaxed my-4">
                    {paragraphLines.map((pl, pIdx) => (
                        <React.Fragment key={pIdx}>
                            {pIdx > 0 && ' '}
                            {renderInline(pl)}
                        </React.Fragment>
                    ))}
                </p>
            );
        }
    }

    return <div className="blog-prose">{elements}</div>;
}
