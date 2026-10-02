'use client';

import { useState, useRef } from 'react';
import ProductDescriptionRenderer from '../../../components/ProductDescriptionRenderer';
import Icon from '../../../components/Icon';

const SAMPLE_TEMPLATE = `Account Includes:
✓ Cash Amount Selected
✓ Rank Amount Selected
✓ Fast Run (Optional Addon)
✓ Rank Unlocks

Console: PS4, PS5, Xbox One & Xbox Series X/S

Once purchased, the account information will be emailed to you within the same day, usually within minutes.

NOTE: There's no need to purchase an additional PS Plus or Xbox Game Pass subscription, nor the game itself, to use this account. If you already own these, your subscriptions and game access will be seamlessly shared across your console.`;

export default function ProductDescriptionEditor({
    defaultValue = '',
    name = 'description',
    label = 'Product Description',
}) {
    const [value, setValue] = useState(defaultValue || '');
    const [mode, setMode] = useState('write'); // 'write' | 'preview'
    const textareaRef = useRef(null);

    const insertText = (snippet) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setValue((prev) => (prev ? `${prev}\n${snippet}` : snippet));
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = value.substring(0, start);
        const after = value.substring(end);

        const needsPrefixNewline = before.length > 0 && !before.endsWith('\n');
        const inserted = (needsPrefixNewline ? '\n' : '') + snippet;

        const next = before + inserted + after;
        setValue(next);

        setTimeout(() => {
            textarea.focus();
            const nextCursor = start + inserted.length;
            textarea.setSelectionRange(nextCursor, nextCursor);
        }, 10);
    };

    const handleApplyTemplate = () => {
        if (value.trim() && !window.confirm('Replace current description with the formatted template?')) {
            return;
        }
        setValue(SAMPLE_TEMPLATE);
    };

    return (
        <div className="space-y-2.5">
            {/* Header with Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                    {label}
                </label>

                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#120e1c] border border-white/10 text-xs font-mono">
                    <button
                        type="button"
                        onClick={() => setMode('write')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                            mode === 'write'
                                ? 'bg-[#9d7cff]/20 text-white font-bold border border-[#9d7cff]/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                            mode === 'preview'
                                ? 'bg-[#9d7cff]/20 text-white font-bold border border-[#9d7cff]/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>Preview</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </button>
                </div>
            </div>

            {/* Formatting Toolbar */}
            {mode === 'write' && (
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#120e1c] border border-white/10 text-xs font-mono">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider mr-1">
                        Format:
                    </span>
                    <button
                        type="button"
                        onClick={() => insertText('✓ Checklist item')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-white/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Add a green checklist item (rendered in 2 columns)"
                    >
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Check Item</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText('Account Includes:\n✓ Feature 1\n✓ Feature 2')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#9d7cff]/20 hover:text-[#9d7cff] text-slate-300 border border-white/10 transition-colors cursor-pointer"
                        title="Add an Includes section"
                    >
                        <span>Account Includes:</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText('Console: PS4, PS5, Xbox One & Xbox Series X/S')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#9d7cff]/20 hover:text-[#9d7cff] text-slate-300 border border-white/10 transition-colors cursor-pointer"
                        title="Add a Console line"
                    >
                        <span>Console: ...</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText('NOTE: Important details about this service go here.')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                        title="Add a NOTE: callout"
                    >
                        <span>NOTE:</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText('Flickr Photo Catalogs:\n✓ Pictures of Male Modded Outfits: https://flic.kr/s/aHBqjBTWye\n✓ Pictures of Female Modded Outfits: https://flic.kr/s/aHBqjBPsAH')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#9d7cff]/20 hover:text-[#9d7cff] text-slate-300 border border-white/10 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        title="Add Flickr Photo Catalogs buttons"
                    >
                        <span className="flex items-center gap-0.5" aria-hidden="true">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0063dc]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff0084]" />
                        </span>
                        <span>Flickr Catalogs</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleApplyTemplate}
                        className="ml-auto px-2.5 py-1 rounded-lg bg-[#9d7cff]/15 hover:bg-[#9d7cff]/25 text-[#9d7cff] hover:text-white border border-[#9d7cff]/30 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Fill with the full sample template"
                    >
                        <Icon name="sparkles" className="w-3.5 h-3.5" />
                        <span>Insert Template</span>
                    </button>
                </div>
            )}

            {/* Hidden Input for Form Submission when in preview mode */}
            <input type="hidden" name={name} value={value} />

            {/* Editor or Live Preview */}
            {mode === 'write' ? (
                <div className="space-y-1.5">
                    <textarea
                        ref={textareaRef}
                        name={name}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Account Includes:&#10;✓ Cash Amount Selected&#10;✓ Rank Amount Selected&#10;&#10;Console: PS4, PS5, Xbox One & Xbox Series X/S&#10;&#10;NOTE: No subscription needed."
                        rows={7}
                        className="w-full bg-[#120e1c] border border-white/10 rounded-2xl p-4 text-white text-xs sm:text-sm font-mono placeholder-slate-500 focus:border-[#9d7cff] focus:ring-1 focus:ring-[#9d7cff]/40 outline-none transition-all leading-relaxed custom-scrollbar shadow-inner"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                        <span>Lines with ✓, -, or [x] automatically display as a 2-column checklist with green checkmarks.</span>
                        <span>{value.length} chars</span>
                    </div>
                </div>
            ) : (
                <div className="p-5 rounded-2xl bg-[#120e1c] border border-white/15 min-h-[180px] shadow-inner">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-white/5 flex items-center justify-between">
                        <span>Live Storefront Preview</span>
                        <span className="text-[#9d7cff]">Rendered output</span>
                    </div>
                    {value.trim() ? (
                        <ProductDescriptionRenderer content={value} />
                    ) : (
                        <div className="text-slate-500 text-xs italic py-6 text-center">
                            No description content yet. Switch to &quot;Write&quot; or click &quot;Insert Template&quot;.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
