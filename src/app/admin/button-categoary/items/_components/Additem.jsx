"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { createItem } from '@/components/lib/categoryItemsApiClient';
import { COLORS } from '@/components/shared/constants';
import { Spinner } from '../../sub-cetegoary/_components/shared/Icons';
import {
    SmartDropdown,
    ColorPicker,
    BuddyModeToggle,
    LangPills,
    ImageUploadField,
} from '../../sub-cetegoary/_components/shared/ui';
import { formatSubCategory, getAllSubCategories } from '@/components/lib/subCategoriesApiClient';

export default function AddItem({ onDone, onCancel }) {
    const [subCategories, setSubCategories] = useState([]);
    const [subCatLoading, setSubCatLoading] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);

    const [word, setWord] = useState('');
    const [speakAs, setSpeakAs] = useState('');
    const [lang, setLang] = useState('en');
    const [color, setColor] = useState(COLORS[0]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [buddyMode, setBuddyMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // If the parent sub-category has Buddy Mode ON, lock it ON here too.
    const parentBuddyMode = selectedSub?.buddy_mode ?? false;
    const parentBuddyLocked = selectedSub !== null && parentBuddyMode === true;
    const effectiveBuddyMode = parentBuddyLocked ? true : buddyMode;

    const imagePreviewUrlRef = useRef('');
    useEffect(() => () => {
        if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
    }, []);

    useEffect(() => {
        setSubCatLoading(true);
        getAllSubCategories().then(res => {
            if (res.success) setSubCategories(res.data);
            else toast.error('Could not load sub-categories');
            setSubCatLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedSub?.buddy_mode) setBuddyMode(true);
    }, [selectedSub]);

    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
        if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
        const url = URL.createObjectURL(f);
        imagePreviewUrlRef.current = url;
        setImageFile(f);
        setImagePreview(url);
    };

    const handleAudioChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) { toast.error('Audio must be under 10MB'); return; }
        setAudioFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSub) { toast.error('Please select a sub-category'); return; }
        if (!word.trim()) { toast.error('Item word is required'); return; }

        setSubmitting(true);
        toast.loading('Creating item...', { id: 'save-item' });
        const res = await createItem(
            selectedSub.id, word.trim(), speakAs, color.value, imageFile, audioFile, true, lang, effectiveBuddyMode
        );
        if (!res.success) { toast.error(res.message, { id: 'save-item' }); setSubmitting(false); return; }

        toast.success('Item created! 🎉', { id: 'save-item' });
        setSubmitting(false);
        onDone();
    };

    // Sub-category options with a display name that includes the main category
    // for context, e.g. "Food → Fruit".
    const subCatOptions = subCategories.map(sc => {
        const formatted = formatSubCategory(sc);
        return { ...sc, displayLabel: `${sc.main_category_name || 'Unknown'} → ${formatted.formattedName}` };
    });

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Add Item</h2>
            <p className="text-sm text-gray-400 mb-6">Create a new item/button under a sub-category.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <SmartDropdown
                    label="Sub-Category"
                    value={selectedSub}
                    options={subCatOptions}
                    onSelect={setSelectedSub}
                    placeholder="Select a sub-category..."
                    loading={subCatLoading}
                    renderName={(sc) => sc.displayLabel}
                />
                {parentBuddyMode && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 -mt-2">
                        <span>🔒</span>
                        <span>This sub-category has Buddy Mode ON — this item will inherit it.</span>
                    </div>
                )}

                <LangPills value={lang} onChange={setLang} />

                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Word *</p>
                    <input
                        type="text" value={word} onChange={e => setWord(e.target.value)}
                        placeholder="e.g. Apple, Happy, Run..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                </div>

                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Speak As <span className="text-gray-400 font-normal normal-case">(optional — overrides TTS pronunciation)</span>
                    </p>
                    <input
                        type="text" value={speakAs} onChange={e => setSpeakAs(e.target.value)}
                        placeholder="e.g. 'Ap-uhl' for unusual pronunciations"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                </div>

                <ColorPicker selected={color} onSelect={setColor} />

                <BuddyModeToggle
                    value={effectiveBuddyMode} onChange={setBuddyMode} locked={parentBuddyLocked}
                    lockedReason={parentBuddyMode ? "Parent sub-category has Buddy Mode ON" : undefined}
                />

                <ImageUploadField imagePreview={imagePreview} onChange={handleImageChange} label="Icon" />

                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Custom Audio <span className="text-gray-400 font-normal normal-case">(optional — device TTS used if not provided)</span>
                    </p>
                    <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl">
                        {audioFile
                            ? <p className="text-sm text-green-600 font-medium">✓ {audioFile.name}</p>
                            : <p className="text-sm text-gray-400">No file selected</p>
                        }
                        <label className="cursor-pointer text-sm font-semibold text-amber-600 hover:text-amber-500 ml-auto">
                            <span>Upload audio</span>
                            <input type="file" className="sr-only" onChange={handleAudioChange} accept="audio/mpeg, audio/wav, audio/mp3" />
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit" disabled={submitting || !selectedSub}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors"
                    >
                        {submitting ? <><Spinner sm /> Creating...</> : '✓ Create Item'}
                    </button>
                </div>
            </form>
        </div>
    );
}