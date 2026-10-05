'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

export default function FaqAccordion({ faqs = [] }) {
    // Open the first question by default for discovery
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (idx) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    if (!faqs || faqs.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                const num = String(index + 1).padStart(2, '0');

                return (
                    <div
                        key={index}
                        className={`transition-colors duration-200 ${
                            isOpen ? 'bg-emerald-500/[0.05]' : 'hover:bg-white/[0.02]'
                        }`}
                    >
                        <button
                            id={`faq-question-${index}`}
                            type="button"
                            onClick={() => toggle(index)}
                            aria-expanded={isOpen}
                            aria-controls={`faq-answer-${index}`}
                            className="w-full py-5 px-6 sm:px-8 flex items-center justify-between gap-4 text-left group focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-[-2px] cursor-pointer"
                        >
                            <span className="flex items-center gap-3 sm:gap-4 font-['Trebuchet_MS',sans-serif] text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors pr-2">
                                <span className="font-mono text-xs sm:text-sm font-black text-emerald-400 shrink-0">
                                    [{num}]
                                </span>
                                <span>{faq.q}</span>
                            </span>

                            <span
                                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ease-out ${
                                    isOpen
                                        ? 'border-emerald-500 bg-emerald-500 text-zinc-950 rotate-45 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
                                        : 'border-white/15 bg-white/5 text-zinc-400 group-hover:border-emerald-500/50 group-hover:text-white'
                                }`}
                                aria-hidden="true"
                            >
                                <Icon name="plus" className="w-4 h-4 stroke-[2.4]" />
                            </span>
                        </button>

                        <div
                            id={`faq-answer-${index}`}
                            role="region"
                            aria-labelledby={`faq-question-${index}`}
                            className={`grid transition-[grid-template-rows,opacity] duration-240 ${
                                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                            style={{ transitionTimingFunction: 'var(--ease-out)' }}
                        >
                            <div className="overflow-hidden">
                                <div className="px-6 pb-6 pt-1 sm:px-8 sm:pb-7 text-sm sm:text-base leading-relaxed text-zinc-300 font-normal border-t border-white/5">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
