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
                let customTitle = 'Visual Process Roadmap';
                let customBadge = 'Sequential Pipeline';
                const stepLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        stepLines.push(l);
                    }
                }

                const stepIcons = [
                    <svg key="1" className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>,
                    <svg key="2" className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>,
                    <svg key="3" className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>,
                    <svg key="4" className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>,
                    <svg key="5" className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>,
                    <svg key="6" className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ];

                const parsedSteps = stepLines.map((l) => {
                    const parts = l.split('|').map((p) => p.trim());
                    const cleanTitle = (parts[0] || '').replace(/^\d+[\.\)]\s*/, '');
                    return {
                        title: cleanTitle,
                        description: parts[1] || '',
                        subtext: parts[2] || ''
                    };
                });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-[#9d7cff]/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#c084fc]">
                                    {customBadge}
                                </span>
                                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                    {parsedSteps.length} Steps
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {parsedSteps.map((step, sIdx) => {
                                const icon = stepIcons[sIdx % stepIcons.length];
                                return (
                                    <div
                                        key={sIdx}
                                        className="relative rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#9d7cff]/40 transition-all duration-200 p-5 flex flex-col justify-between group shadow-sm"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#9d7cff]/10 border border-[#9d7cff]/25 flex items-center justify-center">
                                                    {icon}
                                                </div>
                                                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#9d7cff]/15 text-[#c084fc] border border-[#9d7cff]/25">
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
                                                    <svg className="w-3.5 h-3.5 text-slate-500 hidden lg:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else if (lang === 'timeline' || lang === 'roadmap') {
                let customTitle = 'Milestones & Execution Timeline';
                let customBadge = 'Chronological Roadmap';
                const timelineLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        timelineLines.push(l);
                    }
                }

                const parsedTimeline = timelineLines.map((l) => {
                    const parts = l.split('|').map((p) => p.trim());
                    return {
                        time: parts[0] || '',
                        title: parts[1] || '',
                        description: parts[2] || '',
                        badge: parts[3] || ''
                    };
                });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-cyan-500/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                                    {customBadge}
                                </span>
                                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                    {parsedTimeline.length} Milestones
                                </span>
                            </div>
                        </div>

                        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#9d7cff]/30 space-y-6 sm:space-y-8 my-2">
                            {parsedTimeline.map((item, tIdx) => (
                                <div key={tIdx} className="relative group">
                                    <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#0a0614] border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                                    </div>

                                    <div className="rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-cyan-500/40 p-4 sm:p-5 transition-all">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                                                {item.time}
                                            </span>
                                            {item.badge && (
                                                <span className="text-[11px] font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                                            {item.title}
                                        </h5>
                                        {item.description && (
                                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else if (lang === 'vs' || lang === 'compare') {
                let customTitle = 'Head-to-Head Comparison Matrix';
                let customBadge = 'Comparative Analysis';
                const vsLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        vsLines.push(l);
                    }
                }

                const parsedCards = vsLines.map((l, cIdx) => {
                    const parts = l.split('|').map((p) => p.trim());
                    return {
                        title: parts[0] || `Option 0${cIdx + 1}`,
                        subtitle: parts[1] || '',
                        points: parts.slice(2).filter(Boolean)
                    };
                });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-[#9d7cff]/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 self-start sm:self-auto">
                                {customBadge}
                            </span>
                        </div>

                        <div className={`grid grid-cols-1 ${parsedCards.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 sm:gap-6`}>
                            {parsedCards.map((card, idx) => {
                                const isFirst = idx === 0;
                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-5 sm:p-6 transition-all ${
                                            isFirst
                                                ? 'bg-gradient-to-b from-emerald-500/[0.08] to-transparent border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                                                : 'bg-gradient-to-b from-[#9d7cff]/[0.08] to-transparent border-[#9d7cff]/40 shadow-[0_0_20px_rgba(157,124,255,0.08)]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                                                isFirst
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                    : 'bg-[#9d7cff]/20 text-[#c084fc] border-[#9d7cff]/30'
                                            }`}>
                                                {isFirst ? 'RECOMMENDED' : 'ALTERNATIVE'}
                                            </span>
                                            {card.subtitle && (
                                                <span className="text-xs font-mono text-slate-300">
                                                    {card.subtitle}
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="text-lg font-black text-white mb-4">
                                            {card.title}
                                        </h5>
                                        <ul className="space-y-2.5">
                                            {card.points.map((pt, pIdx) => (
                                                <li key={pIdx} className="text-xs text-slate-200 flex items-start gap-2.5 leading-relaxed">
                                                    <svg className={`w-4 h-4 mt-0.5 shrink-0 ${isFirst ? 'text-emerald-400' : 'text-[#c084fc]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>{pt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else if (lang === 'cycle' || lang === 'loop') {
                let customTitle = 'Cyclic Workflow & Farming Loop';
                let customBadge = 'Closed-Loop System';
                const loopLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        loopLines.push(l);
                    }
                }

                const parsedPhases = loopLines.map((l) => {
                    const parts = l.split('|').map((p) => p.trim());
                    return {
                        phase: parts[0] || '',
                        description: parts[1] || '',
                        timing: parts[2] || '',
                        badge: parts[3] || ''
                    };
                });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-emerald-500/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                    {customBadge}
                                </span>
                                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                    {parsedPhases.length} Phases
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {parsedPhases.map((phase, pIdx) => (
                                <div key={pIdx} className="relative rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 p-5 flex flex-col justify-between transition-all group">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                                                PHASE 0{pIdx + 1}
                                            </span>
                                            {phase.timing && (
                                                <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{phase.timing}</span>
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                                            {phase.phase}
                                        </h5>
                                        {phase.description && (
                                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                                                {phase.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                                        <span className="text-emerald-400 font-semibold">
                                            {phase.badge || 'Repeat Cycle'}
                                        </span>
                                        {pIdx === parsedPhases.length - 1 ? (
                                            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span>Loop</span>
                                            </span>
                                        ) : (
                                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else if (lang === 'decision' || lang === 'logic') {
                let customTitle = 'Branching Decision Tree';
                let customBadge = 'Decision Logic';
                const decisionLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        decisionLines.push(l);
                    }
                }

                const parsedRules = decisionLines.map((l) => {
                    const delimiter = l.includes('➔') ? '➔' : '|';
                    const parts = l.split(delimiter).map((p) => p.trim());
                    return {
                        condition: parts[0] || '',
                        action: parts.slice(1, parts.length - 1).join(' ➔ ') || parts[1] || '',
                        outcome: parts[parts.length - 1] || ''
                    };
                });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-amber-500/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 self-start sm:self-auto">
                                {customBadge} ({parsedRules.length} Branches)
                            </span>
                        </div>

                        <div className="space-y-4">
                            {parsedRules.map((rule, rIdx) => (
                                <div key={rIdx} className="rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                IF SCENARIO
                                            </span>
                                            <span className="text-sm font-bold text-white">
                                                {rule.condition}
                                            </span>
                                        </div>
                                        {rule.action && (
                                            <div className="text-xs text-slate-300 pl-3 border-l-2 border-amber-500/40 mt-2 flex items-center gap-2">
                                                <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <span><span className="font-semibold text-slate-200">Action:</span> {rule.action}</span>
                                            </div>
                                        )}
                                    </div>
                                    {rule.outcome && (
                                        <div className="shrink-0">
                                            <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-emerald-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{rule.outcome}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else if (lang === 'stack' || lang === 'pyramid') {
                let customTitle = 'Rank Hierarchy & Progression Pyramid';
                let customBadge = 'Tier Architecture';
                const stackLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        stackLines.push(l);
                    }
                }

                const parsedTiers = stackLines.map((l) => {
                    const parts = l.split('|').map((p) => p.trim());
                    return {
                        tier: parts[0] || '',
                        share: parts[1] || '',
                        description: parts[2] || ''
                    };
                });

                const tierColors = [
                    'border-amber-400/40 bg-amber-500/[0.08] text-amber-200',
                    'border-rose-400/40 bg-rose-500/[0.08] text-rose-200',
                    'border-purple-400/40 bg-purple-500/[0.08] text-[#c084fc]',
                    'border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-200',
                    'border-slate-500/30 bg-white/[0.03] text-slate-300'
                ];

                const tierWidths = ['max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl'];

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-[#9d7cff]/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 self-start sm:self-auto">
                                {customBadge} ({parsedTiers.length} Levels)
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-3.5 my-4">
                            {parsedTiers.map((t, idx) => {
                                const colorClass = tierColors[idx % tierColors.length];
                                const widthClass = tierWidths[Math.min(idx, tierWidths.length - 1)];

                                return (
                                    <div
                                        key={idx}
                                        className={`w-full ${widthClass} rounded-xl border p-4 sm:p-5 transition-all shadow-sm ${colorClass}`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-bold text-white text-base">
                                                {t.tier}
                                            </span>
                                            {t.share && (
                                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                                                    {t.share}
                                                </span>
                                            )}
                                        </div>
                                        {t.description && (
                                            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                                                {t.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else if (lang === 'risk' || lang === 'spectrum') {
                let customTitle = 'Risk vs. Reward Spectrum';
                let customBadge = 'Risk / Yield Analysis';
                const riskLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        riskLines.push(l);
                    }
                }

                const parsedProfiles = riskLines.map((l) => {
                    const parts = l.split('|').map((p) => p.trim());
                    return {
                        level: parts[0] || '',
                        title: parts[1] || '',
                        description: parts[2] || '',
                        yield: parts[3] || '',
                        tag: parts[4] || ''
                    };
                });

                const riskStyles = [
                    { border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]' },
                    { border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]' },
                    { border: 'border-rose-500/40', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.08)]' }
                ];

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 self-start sm:self-auto">
                                {customBadge}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {parsedProfiles.map((p, idx) => {
                                const style = riskStyles[idx % riskStyles.length];
                                return (
                                    <div key={idx} className={`rounded-xl border ${style.border} ${style.glow} bg-white/[0.02] p-5 flex flex-col justify-between`}>
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                                                    {p.level}
                                                </span>
                                                {p.tag && (
                                                    <span className="text-xs font-mono text-slate-300">
                                                        {p.tag}
                                                    </span>
                                                )}
                                            </div>
                                            <h5 className="font-bold text-white text-base mb-2">
                                                {p.title}
                                            </h5>
                                            <p className="text-xs text-slate-200 leading-relaxed">
                                                {p.description}
                                            </p>
                                        </div>
                                        {p.yield && (
                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                                                <span className="text-slate-300">Expected Yield:</span>
                                                <span className="text-emerald-400 font-bold">{p.yield}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else if (lang === 'quadrant') {
                let customTitle = 'Strategic 2×2 Decision Matrix';
                let customBadge = 'Quadrant Analysis';
                const quadLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        quadLines.push(l);
                    }
                }

                const parsedQuads = quadLines.map((l) => {
                    const parts = l.split('|').map((p) => p.trim());
                    return {
                        quadrant: parts[0] || '',
                        title: parts[1] || '',
                        description: parts[2] || ''
                    };
                });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-[#9d7cff]/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 self-start sm:self-auto">
                                {customBadge}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {parsedQuads.map((q, idx) => {
                                const isTopRight = idx === 0;
                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-5 transition-all ${
                                            isTopRight
                                                ? 'bg-emerald-500/[0.06] border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.06)]'
                                                : 'bg-white/[0.03] border-white/10 hover:border-purple-500/40'
                                        }`}
                                    >
                                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                                            isTopRight ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-slate-300 border-white/10'
                                        }`}>
                                            {q.quadrant}
                                        </span>
                                        <h5 className="font-bold text-white text-base mt-2.5 mb-1.5">
                                            {q.title}
                                        </h5>
                                        <p className="text-xs text-slate-200 leading-relaxed">
                                            {q.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else if (lang === 'bento') {
                let customTitle = 'Comprehensive Ecosystem Grid';
                let customBadge = 'Bento Overview';
                const bentoLines = [];

                for (const rawL of codeLines) {
                    const l = rawL.trim();
                    if (/^title:\s*/i.test(l)) {
                        customTitle = l.replace(/^title:\s*/i, '').trim();
                    } else if (/^badge:\s*/i.test(l)) {
                        customBadge = l.replace(/^badge:\s*/i, '').trim();
                    } else if (l) {
                        bentoLines.push(l);
                    }
                }

                const parsedBento = bentoLines.map((l) => {
                    const parts = l.split('|').map((p) => p.trim());
                    return {
                        layout: parts[0] || 'normal',
                        title: parts[1] || '',
                        description: parts[2] || '',
                        badge: parts[3] || ''
                    };
                });

                elements.push(
                    <div key={key++} className="my-10 rounded-2xl bg-gradient-to-br from-[#16102a] via-[#100a1c] to-[#0a0614] border border-[#9d7cff]/30 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-white tracking-tight">
                                    {customTitle}
                                </h4>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#c084fc] self-start sm:self-auto">
                                {customBadge}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {parsedBento.map((item, bIdx) => {
                                const isWide = item.layout.includes('wide') || item.layout.includes('full');
                                const isLarge = item.layout.includes('large');
                                const spanClass = isWide ? 'md:col-span-3' : isLarge ? 'md:col-span-2' : 'md:col-span-1';

                                return (
                                    <div
                                        key={bIdx}
                                        className={`${spanClass} rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#9d7cff]/40 p-5 sm:p-6 flex flex-col justify-between transition-all`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2.5">
                                                <h5 className="font-bold text-white text-base">
                                                    {item.title}
                                                </h5>
                                                {item.badge && (
                                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#9d7cff]/15 text-[#c084fc] border border-[#9d7cff]/25">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-200 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else {
                // High-polish terminal code / command block
                elements.push(
                    <div key={key++} className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0c0816] shadow-xl">
                        {/* Terminal title bar with macOS-like dots */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#140e24] border-b border-white/5">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                                <span className="ml-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                    {lang || 'Code'}
                                </span>
                            </div>
                            <span className="text-xs font-mono text-slate-500">Terminal</span>
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
                    className="border border-[#9d7cff]/20 bg-[#161126]/40 px-6 py-5 rounded-xl my-6 text-slate-200 italic text-base leading-relaxed"
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
                <p key={key++} className="text-slate-300 text-base leading-relaxed my-4">
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
