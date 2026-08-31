"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { updateSubCategory } from '@/components/lib/subCategoriesApiClient';

import { getCatName } from './shared/Helpers';
import { Spinner } from './shared/Icons';
import {
  ColorPicker,
  BuddyModeToggle,
  LangPills,
  ImageUploadField,
} from './shared/ui';
import { COLORS } from './shared/Constants';

export default function EditSubCategoary({ subCategory, onDone, onCancel }) {
  const existingLang = Object.keys(subCategory.translations || {})[0] || 'en';
  const existingName = getCatName(subCategory, existingLang);
  const existingColor = COLORS.find(c => c.value === subCategory.color) || COLORS[0];

  const [name, setName] = useState(existingName);
  const [lang, setLang] = useState(existingLang);
  const [color, setColor] = useState(existingColor);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(subCategory.image_icon || subCategory.icon || '');
  const [buddyMode, setBuddyMode] = useState(subCategory.buddy_mode || false);
  const [submitting, setSubmitting] = useState(false);

  // If the parent main category has Buddy Mode ON, lock it the same way
  // AddSubCategory does. mainCategoryBuddyMode is attached by index.js when
  // it flattens sub-categories for the list/edit flow.
  const parentBuddyMode = subCategory.mainCategoryBuddyMode ?? false;
  const parentBuddyLocked = parentBuddyMode === true;
  const effectiveBuddyMode = parentBuddyLocked ? true : buddyMode;

  const iconPreviewUrlRef = useRef('');
  useEffect(() => () => {
    if (iconPreviewUrlRef.current) URL.revokeObjectURL(iconPreviewUrlRef.current);
  }, []);

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
    if (!name.trim()) { toast.error('Sub-category name is required'); return; }

    setSubmitting(true);
    toast.loading('Updating sub-category...', { id: 'update-sub' });
    const res = await updateSubCategory(
      subCategory.id, name.trim(), color.value, iconFile, null, true, lang, effectiveBuddyMode
    );
    if (!res.success) { toast.error(res.message, { id: 'update-sub' }); setSubmitting(false); return; }

    toast.success('Sub-category updated! ✓', { id: 'update-sub' });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Edit Sub-Category</h2>
      <p className="text-sm text-gray-400 mb-6">
        Under <span className="font-semibold text-gray-600">{subCategory.mainCategoryName || 'Unknown category'}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {parentBuddyMode && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <span>🔒</span>
            <span>This category has Buddy Mode ON — this sub-category inherits it.</span>
          </div>
        )}

        <LangPills value={lang} onChange={setLang} />

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sub-Category Name *</p>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Animals, Colors, Food..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>

        <ColorPicker selected={color} onSelect={setColor} />

        <BuddyModeToggle
          value={effectiveBuddyMode} onChange={setBuddyMode} locked={parentBuddyLocked}
          lockedReason={parentBuddyMode ? "Parent has Buddy Mode ON" : undefined}
        />

        <ImageUploadField imagePreview={iconPreview} onChange={handleIconChange} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors"
          >
            {submitting ? <><Spinner sm /> Updating...</> : '✓ Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}