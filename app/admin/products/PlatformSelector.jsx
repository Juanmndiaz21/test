'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { PlayStationIcon, XboxIcon, PcIcon, AllPlatformsIcon } from '../../../components/PlatformBadges';
import Icon from '../../../components/Icon';
import { updateProductPlatform } from './actions';
import { toast } from '../../../utils/toast';

export const PLATFORM_PRESETS = [
    { value: 'PC/PlayStation/Xbox', label: 'All Platforms (PC, PS, Xbox)', shortLabel: 'All Platforms', pc: true, ps: true, xbox: true },
    { value: 'PC', label: 'PC Windows Only', shortLabel: 'PC', pc: true, ps: false, xbox: false },
    { value: 'PlayStation', label: 'PlayStation Only', shortLabel: 'PlayStation', pc: false, ps: true, xbox: false },
    { value: 'Xbox', label: 'Xbox Only', shortLabel: 'Xbox', pc: false, ps: false, xbox: true },
    { value: 'PlayStation/Xbox', label: 'PlayStation & Xbox (Console)', shortLabel: 'PS / Xbox', pc: false, ps: true, xbox: true },
    { value: 'PC/PlayStation', label: 'PC & PlayStation', shortLabel: 'PC / PS', pc: true, ps: true, xbox: false },
    { value: 'PC/Xbox', label: 'PC & Xbox', shortLabel: 'PC / Xbox', pc: true, ps: false, xbox: true },
];

export function parsePlatformFlags(platformString = '') {
    const raw = String(platformString || '').toLowerCase().trim();
    if (!raw || raw === 'all' || raw === 'all platforms') {
        return { pc: true, ps: true, xbox: true, isAll: true };
    }
    const pc = raw.includes('pc') || raw.includes('windows');
    const ps = raw.includes('playstation') || raw.includes('ps');
    const xbox = raw.includes('xbox');

    if (!pc && !ps && !xbox) {
        return { pc: true, ps: true, xbox: true, isAll: true };
    }
    return { pc, ps, xbox, isAll: pc && ps && xbox };
}

export function buildPlatformString({ pc, ps, xbox }) {
    if ((pc && ps && xbox) || (!pc && !ps && !xbox)) {
        return 'PC/PlayStation/Xbox';
    }
    const parts = [];
    if (pc) parts.push('PC');
    if (ps) parts.push('PlayStation');
    if (xbox) parts.push('Xbox');
    return parts.join('/');
}

/**
 * Interactive Platform Cell for Products Table
 * Allows instant, 1-click platform switching with optimistic feedback
 */
export function PlatformTableCell({ product, onPlatformChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPlatform, setCurrentPlatform] = useState(product.platform || 'PlayStation/Xbox');
    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef(null);

    useEffect(() => {
        setCurrentPlatform(product.platform || 'PlayStation/Xbox');
    }, [product.platform]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const { pc, ps, xbox, isAll } = parsePlatformFlags(currentPlatform);

    const handleSelectPlatform = (newPlatformValue) => {
        if (newPlatformValue === currentPlatform) {
            setIsOpen(false);
            return;
        }

        const previousValue = currentPlatform;
        setCurrentPlatform(newPlatformValue);
        setIsOpen(false);

        startTransition(async () => {
            try {
                await updateProductPlatform(product.id, newPlatformValue);
                toast.success(`Platform updated to ${newPlatformValue}`, {
                    title: product.name,
                });
                if (onPlatformChange) {
                    onPlatformChange(product.id, newPlatformValue);
                }
            } catch (err) {
                setCurrentPlatform(previousValue);
                toast.error(err.message || 'Failed to update platform');
            }
        });
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                title="Click to change platform"
                className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    isOpen
                        ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-white shadow-sm ring-1 ring-[#9d7cff]/40'
                        : 'bg-[#120e1c] border-white/10 hover:border-white/20 text-slate-300 hover:text-white hover:bg-white/[0.04]'
                } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
            >
                {/* Visual Icons */}
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-200">
                    {isAll ? (
                        <AllPlatformsIcon className="w-3.5 h-3.5 text-[#9d7cff]" />
                    ) : (
                        <>
                            {pc && <PcIcon className="w-3.5 h-3.5 text-blue-400" />}
                            {ps && <PlayStationIcon className="w-3.5 h-3.5 text-indigo-400" />}
                            {xbox && <XboxIcon className="w-3.5 h-3.5 text-green-400" />}
                        </>
                    )}
                </div>

                {/* Platform Label */}
                <span className="font-medium text-slate-200 group-hover:text-white">
                    {currentPlatform === 'PC/PlayStation/Xbox' || currentPlatform === 'All'
                        ? 'All platforms'
                        : currentPlatform}
                </span>

                {/* Interactive Chevron / Loading indicator */}
                {isPending ? (
                    <span className="w-3 h-3 border-2 border-[#9d7cff] border-t-transparent rounded-full animate-spin ml-0.5" />
                ) : (
                    <Icon
                        name="chevron-down"
                        className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-[#171229] border border-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.65)] backdrop-blur-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="uppercase font-bold tracking-wider text-slate-300">Set Platform</span>
                        <span className="text-slate-500">#{product.id}</span>
                    </div>

                    <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                        {PLATFORM_PRESETS.map((preset) => {
                            const isSelected = currentPlatform === preset.value;
                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => handleSelectPlatform(preset.value)}
                                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#9d7cff]/20 text-white font-bold border border-[#9d7cff]/30'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-slate-400">
                                            {preset.pc && <PcIcon className="w-3.5 h-3.5 text-blue-400" />}
                                            {preset.ps && <PlayStationIcon className="w-3.5 h-3.5 text-indigo-400" />}
                                            {preset.xbox && <XboxIcon className="w-3.5 h-3.5 text-green-400" />}
                                        </div>
                                        <span>{preset.label}</span>
                                    </div>
                                    {isSelected && <Icon name="check" className="w-3.5 h-3.5 text-[#9d7cff]" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="pt-1.5 border-t border-white/5 px-2 text-xs font-mono text-slate-400 flex items-center justify-between">
                        <span>Changes apply immediately</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Form Platform Field for AddProductForm and ProductEditDrawer
 * Features interactive toggle pills for PC, PlayStation, and Xbox + quick presets
 */
export function PlatformFormField({ initialPlatform = 'PlayStation/Xbox', name = 'platform' }) {
    const [selected, setSelected] = useState(() => parsePlatformFlags(initialPlatform));

    const toggle = (key) => {
        setSelected((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            // Ensure at least one is selected; if all false, select the one toggled
            if (!next.pc && !next.ps && !next.xbox) {
                next[key] = true;
            }
            next.isAll = next.pc && next.ps && next.xbox;
            return next;
        });
    };

    const applyPreset = (preset) => {
        setSelected({
            pc: preset.pc,
            ps: preset.ps,
            xbox: preset.xbox,
            isAll: preset.pc && preset.ps && preset.xbox,
        });
    };

    const serializedValue = buildPlatformString(selected);

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                    Platform Compatibility
                </label>
                <span className="text-[11px] font-mono text-[#9d7cff] font-bold">
                    {serializedValue}
                </span>
            </div>

            {/* Hidden input passed to server action */}
            <input type="hidden" name={name} value={serializedValue} />

            {/* Interactive Toggle Buttons */}
            <div className="grid grid-cols-3 gap-2">
                {/* PC */}
                <button
                    type="button"
                    onClick={() => toggle('pc')}
                    className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                        selected.pc
                            ? 'bg-blue-500/20 border-blue-400/50 text-white shadow-sm ring-1 ring-blue-500/30'
                            : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                    <PcIcon className={`w-4 h-4 ${selected.pc ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>PC</span>
                    {selected.pc && <Icon name="check" className="w-3 h-3 text-blue-400 ml-auto" />}
                </button>

                {/* PlayStation */}
                <button
                    type="button"
                    onClick={() => toggle('ps')}
                    className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                        selected.ps
                            ? 'bg-indigo-500/20 border-indigo-400/50 text-white shadow-sm ring-1 ring-indigo-500/30'
                            : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                    <PlayStationIcon className={`w-4 h-4 ${selected.ps ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>PlayStation</span>
                    {selected.ps && <Icon name="check" className="w-3 h-3 text-indigo-400 ml-auto" />}
                </button>

                {/* Xbox */}
                <button
                    type="button"
                    onClick={() => toggle('xbox')}
                    className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                        selected.xbox
                            ? 'bg-green-500/20 border-green-400/50 text-white shadow-sm ring-1 ring-green-500/30'
                            : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                    <XboxIcon className={`w-4 h-4 ${selected.xbox ? 'text-green-400' : 'text-slate-500'}`} />
                    <span>Xbox</span>
                    {selected.xbox && <Icon name="check" className="w-3 h-3 text-green-400 ml-auto" />}
                </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-mono text-slate-400 uppercase mr-1">Presets:</span>
                <button
                    type="button"
                    onClick={() => applyPreset({ pc: true, ps: true, xbox: true })}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        selected.isAll
                            ? 'bg-[#9d7cff]/20 border-[#9d7cff]/50 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                >
                    All Platforms
                </button>
                <button
                    type="button"
                    onClick={() => applyPreset({ pc: false, ps: true, xbox: true })}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        !selected.pc && selected.ps && selected.xbox
                            ? 'bg-[#9d7cff]/20 border-[#9d7cff]/50 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                >
                    Consoles (PS + Xbox)
                </button>
                <button
                    type="button"
                    onClick={() => applyPreset({ pc: true, ps: false, xbox: false })}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        selected.pc && !selected.ps && !selected.xbox
                            ? 'bg-[#9d7cff]/20 border-[#9d7cff]/50 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                >
                    PC Only
                </button>
            </div>
        </div>
    );
}
