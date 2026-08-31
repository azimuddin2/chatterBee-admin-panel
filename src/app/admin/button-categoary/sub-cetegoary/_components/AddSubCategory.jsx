"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { createSubCategory } from '@/components/lib/subCategoriesApiClient';

import { fetchRootCategories, getCatName } from './shared/Helpers';
import { Spinner } from './shared/Icons';
import {
  SmartDropdown,
  ColorPicker,
  BuddyModeToggle,
  LangPills,
  ImageUploadField,
} from './shared/ui';
import { COLORS } from './shared/Constants';

export default function AddSubCategoary({ onDone, onCancel }) {
  const [mainCategories, setMainCategories] = useState([]);
  const [mainCatLoading, setMainCatLoading] = useState(false);
  const [selectedMain, setSelectedMain] = useState(null);

  const [name, setName] = useState('');
  const [lang, setLang] = useState('en');
  const [color, setColor] = useState(COLORS[0]);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [buddyMode, setBuddyMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const parentBuddyMode = selectedMain?.buddy_mode ?? false;
  const parentBuddyLocked = selectedMain !== null && parentBuddyMode === true;
  const effectiveBuddyMode = parentBuddyLocked ? true : buddyMode;

  const iconPreviewUrlRef = useRef('');
  useEffect(() => () => {
    if (iconPreviewUrlRef.current) URL.revokeObjectURL(iconPreviewUrlRef.current);
  }, []);

  useEffect(() => {
    setMainCatLoading(true);
    fetchRootCategories().then(res => {
      if (res.success) setMainCategories(res.data);
      else toast.error('Could not load main categories');
      setMainCatLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedMain?.buddy_mode) setBuddyMode(true);
  }, [selectedMain]);

  const handleIconChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (iconPreviewUrlRef.current) URL.revokeObjectURL(iconPreviewUrlRef.current);
    const url = URL.createObjectURL(f);
    iconPreviewUrlRef.current = url;
    setIconFile(f);
    setIconPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMain) { toast.error('Please select a main category'); return; }
    if (!name.trim()) { toast.error('Sub-category name is required'); return; }

    setSubmitting(true);
    toast.loading('Creating sub-category...', { id: 'save-sub' });
    const res = await createSubCategory(
      selectedMain.id, name.trim(), color.value, iconFile, null, true, lang, effectiveBuddyMode
    );
    if (!res.success) { toast.error(res.message, { id: 'save-sub' }); setSubmitting(false); return; }

    toast.success('Sub-category created! 🎉', { id: 'save-sub' });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Add Sub-Category</h2>
      <p className="text-sm text-gray-400 mb-6">Create a new sub-category under a main category.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <SmartDropdown
          label="Main Category"
          value={selectedMain}
          options={mainCategories}
          onSelect={setSelectedMain}
          placeholder="Select a main category..."
          loading={mainCatLoading}
          renderName={getCatName}
        />
        {selectedMain?.buddy_mode && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 -mt-2">
            <span>🔒</span>
            <span>This category has Buddy Mode ON — this sub-category will inherit it.</span>
          </div>
        )}

        <LangPills value={lang} onChange={setLang} />

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sub-Category Name *</p>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Animals, Colors, Food..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
        </div>

        <ColorPicker selected={color} onSelect={setColor} />

        <BuddyModeToggle value={effectiveBuddyMode} onChange={setBuddyMode} locked={parentBuddyLocked}
          lockedReason={parentBuddyMode ? "Parent has Buddy Mode ON" : undefined} />

        <ImageUploadField imagePreview={iconPreview} onChange={handleIconChange} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting || !selectedMain}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors">
            {submitting ? <><Spinner sm /> Creating...</> : '✓ Create Sub-Category'}
          </button>
        </div>
      </form>
    </div>
  );
}