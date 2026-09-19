'use client';

import { useState } from 'react';

const textClass = (compact) => compact
    ? 'w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-lime-300 outline-none'
    : 'w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none';

const labelClass = () => 'block text-xs font-semibold text-slate-400 mb-1.5';

export default function ProductOptionsEditor({
    initialOptions = [],
    options = [],
    boostOptions = [],
    compact = false,
}) {
    const effectiveInitial = (initialOptions && initialOptions.length > 0)
        ? initialOptions
        : ((options && options.length > 0) ? options : boostOptions);

    return (
        <div className="w-full md:col-span-2">
            <OptionList title="Options & Pricing by Amount" prefix="options" initialOptions={effectiveInitial} compact={compact} />
        </div>
    );
}

function OptionList({ title, prefix, initialOptions, compact }) {
    const [rows, setRows] = useState(() =>
        initialOptions && initialOptions.length > 0
            ? initialOptions.map((opt) => ({
                amount: String(opt.amount),
                label: opt.label || `${opt.amount}M`,
                price: (opt.price !== undefined && opt.price !== null) ? String(opt.price) : '',
            }))
            : [{ amount: '100', label: '100M', price: '' }]
    );

    const updateRow = (index, patch) => {
        setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const removeRow = (index) => {
        setRows((current) => current.filter((_, i) => i !== index));
    };

    const addRow = () => {
        setRows((current) => {
            const lastRow = current[current.length - 1];
            const lastAmount = Number(lastRow?.amount) || 0;
            const nextAmount = lastAmount + 100;
            const nextPrice = lastRow?.price ? String(Number(lastRow.price) + 25) : '';
            return [...current, { amount: String(nextAmount), label: `${nextAmount}M`, price: nextPrice }];
        });
    };

    return (
        <div className="panel-surface rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-sm text-slate-200 font-bold">{title}</label>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Define the amount, label, and custom price for each option. If price is left empty, the service base price will be used.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addRow}
                    className="text-lime-300 hover:text-white font-bold text-sm cursor-pointer whitespace-nowrap ml-3"
                >
                    + Add tier
                </button>
            </div>

            <div className="space-y-3">
                {rows.map((row, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="sm:col-span-3">
                            <label className={labelClass()}>Amount</label>
                            <input
                                name={`${prefix}_amount_${index}`}
                                type="number"
                                min="1"
                                step="1"
                                value={row.amount}
                                onChange={(e) => updateRow(index, { amount: e.target.value })}
                                required
                                placeholder="e.g. 100"
                                className={textClass(compact)}
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <label className={labelClass()}>Label</label>
                            <input
                                name={`${prefix}_label_${index}`}
                                type="text"
                                value={row.label}
                                onChange={(e) => updateRow(index, { label: e.target.value })}
                                required
                                placeholder="e.g. 100M"
                                className={textClass(compact)}
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className={labelClass()}>Price ($)</label>
                            <input
                                name={`${prefix}_price_${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={row.price}
                                onChange={(e) => updateRow(index, { price: e.target.value })}
                                placeholder="Base price"
                                className={textClass(compact)}
                            />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                disabled={rows.length <= 1}
                                className="w-full text-center py-2 px-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg font-bold text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}