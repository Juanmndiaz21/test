'use client';

import { useState, useRef, useEffect } from 'react';
import { LuUpload, LuImage, LuX, LuLoader, LuFolderOpen, LuCheck } from 'react-icons/lu';
import { toast } from '../../../utils/toast';

export default function ImageUploadField({
    name = 'image_url',
    value: controlledValue,
    defaultValue = '',
    onChange,
    label = 'Service image / Logo',
    compact = false,
}) {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

    const [isUploading, setIsUploading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const fileInputRef = useRef(null);

    const updateValue = (newValue) => {
        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }
        if (typeof onChange === 'function') {
            onChange(newValue);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image exceeds 5 MB limit.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            updateValue(data.url);
            toast.success('Image uploaded successfully!', { title: 'Upload successful' });
        } catch (err) {
            toast.error(err.message || 'Error uploading image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const fetchGallery = async () => {
        setIsLoadingGallery(true);
        try {
            const res = await fetch('/api/admin/upload');
            const data = await res.json();
            if (res.ok && Array.isArray(data.files)) {
                setGalleryImages(data.files);
            }
        } catch {
            // Silently handle error
        } finally {
            setIsLoadingGallery(false);
        }
    };

    const toggleGallery = () => {
        if (!showGallery) {
            fetchGallery();
        }
        setShowGallery(!showGallery);
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                <label className={`block text-slate-300 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                    {label}
                </label>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleGallery}
                        className="text-[11px] text-[#9d7cff] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                        <LuFolderOpen className="w-3 h-3" />
                        <span>{showGallery ? 'Hide gallery' : 'Choose uploaded'}</span>
                    </button>
                    {currentValue && (
                        <button
                            type="button"
                            onClick={() => updateValue('')}
                            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-medium"
                        >
                            <LuX className="w-3 h-3" />
                            <span>Remove image</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                    <input
                        name={name}
                        type="text"
                        value={currentValue}
                        onChange={(e) => updateValue(e.target.value)}
                        placeholder="e.g. /uploads/logo.png or https://..."
                        className={`w-full bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#9d7cff] focus:ring-1 focus:ring-[#9d7cff]/40 outline-none transition-all ${
                            compact ? 'p-2 text-xs' : 'p-3 text-sm'
                        }`}
                    />
                </div>

                <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                        isUploading
                            ? 'bg-[#9d7cff]/30 text-white cursor-wait'
                            : 'bg-[#9d7cff]/15 hover:bg-[#9d7cff] text-[#9d7cff] hover:text-[#0d0914] border border-[#9d7cff]/40'
                    } ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}
                    title="Select image from your computer"
                >
                    {isUploading ? (
                        <>
                            <LuLoader className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <LuUpload className="w-4 h-4" />
                            <span>Upload image from PC</span>
                        </>
                    )}
                </button>
            </div>

            {/* Gallery of already uploaded images */}
            {showGallery && (
                <div className="p-3 rounded-xl bg-black/50 border border-[#9d7cff]/20 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-bold flex items-center gap-1.5 text-[#9d7cff]">
                            <LuFolderOpen className="w-3.5 h-3.5" />
                            Uploaded images ({galleryImages.length})
                        </span>
                        <span className="text-[11px] text-slate-400">Click any image to select it</span>
                    </div>

                    {isLoadingGallery ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <LuLoader className="w-4 h-4 animate-spin text-[#9d7cff]" />
                            <span>Loading images...</span>
                        </div>
                    ) : galleryImages.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center italic">
                            No images uploaded yet. Upload your first image using the button above.
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                            {galleryImages.map((img) => {
                                const isSelected = currentValue === img.url;
                                return (
                                    <button
                                        key={img.filename}
                                        type="button"
                                        onClick={() => {
                                            updateValue(img.url);
                                            setShowGallery(false);
                                        }}
                                        className={`group relative aspect-square rounded-lg border p-1 bg-[#161224] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                                            isSelected
                                                ? 'border-[#9d7cff] ring-2 ring-[#9d7cff]/50'
                                                : 'border-white/10 hover:border-[#9d7cff]/60 hover:scale-105'
                                        }`}
                                        title={img.filename}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.url}
                                            alt={img.filename}
                                            className="w-full h-full object-contain"
                                        />
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#9d7cff] text-[#0d0914] flex items-center justify-center">
                                                <LuCheck className="w-2.5 h-2.5 stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Current Image Preview Card */}
            {currentValue && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-black/40 border border-white/10 max-w-md">
                    <div className="w-12 h-12 rounded-md bg-[#161224] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={currentValue}
                            alt="Logo preview"
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-mono text-[#9d7cff] truncate">
                            {currentValue}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <LuImage className="w-3 h-3 text-emerald-400" />
                            <span>Assigned image</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
