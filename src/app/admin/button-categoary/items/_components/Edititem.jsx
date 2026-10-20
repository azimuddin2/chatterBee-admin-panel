"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { updateItem, formatItem } from '@/components/lib/categoryItemsApiClient';
import { formatSubCategory, getAllSubCategories } from '@/components/lib/subCategoriesApiClient';
import { COLORS } from '../../sub-cetegoary/_components/shared/Constants'; // same list the ColorPicker in ui.jsx uses
import { Spinner } from '../../sub-cetegoary/_components/shared/Icons';
import {
  SmartDropdown,
  ColorPicker,
  BuddyModeToggle,
  LangPills,
  ImageUploadField,
} from '../../sub-cetegoary/_components/shared/ui';

export default function EditItem({ item, onDone, onCancel }) {
  const existingLang = Object.keys(item.translations || {})[0] || 'en';
  const formatted = formatItem(item, existingLang);
  // Normalize so "#FFAA00", "ffaa00", " #ffaa00 " all match.
  const normColor = (v) => {
    const s = String(v ?? '').trim().toLowerCase();
    return s && !s.startsWith('#') && /^[0-9a-f]{3,8}$/.test(s) ? `#${s}` : s;
  };
  // The list page shows the swatch from formatItem().displayColor, so use the
  // exact same source here. Fall back to raw fields only if it is missing.
  const rawColor =
    formatted.displayColor ?? item.color ?? item.colour ?? item.color_code ?? item.bg_color;
  const existingColor =
    COLORS.find(c => normColor(c.value) === normColor(rawColor)) ||
    COLORS.find(c => c.name && c.name.toLowerCase() === String(rawColor ?? '').toLowerCase()) ||
    (rawColor ? { name: 'Current', value: rawColor } : COLORS[0]);

  // Sub-category
  const [subCategories, setSubCategories] = useState([]);
  const [subCatLoading, setSubCatLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  // Item fields
  const [word, setWord] = useState(formatted.formattedWord);
  const [speakAs, setSpeakAs] = useState(item.translations?.[existingLang]?.speak_as || '');
  const [lang, setLang] = useState(existingLang);
  const [color, setColor] = useState(existingColor);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image_icon || '');
  const [audioFile, setAudioFile] = useState(null);
  const [buddyMode, setBuddyMode] = useState(item.buddy_mode || false);
  const [submitting, setSubmitting] = useState(false);

  // If the selected sub-category has Buddy Mode ON, lock it ON here too.
  const parentBuddyMode = selectedSub?.buddy_mode ?? false;
  const parentBuddyLocked = selectedSub !== null && parentBuddyMode === true;
  const effectiveBuddyMode = parentBuddyLocked ? true : buddyMode;

  const imagePreviewUrlRef = useRef('');
  useEffect(() => () => {
    if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
  }, []);

  // Load sub-categories and pre-select the item's current one.
  useEffect(() => {
    let cancelled = false;
    setSubCatLoading(true);
    getAllSubCategories().then(res => {
      if (cancelled) return;
      if (res.success) {
        setSubCategories(res.data);
        const currentId =
          typeof item.category === 'object' ? item.category?.id : item.category;

        // 1) match by id (string-safe: 5 and "5" are treated as equal)
        let current = res.data.find(sc => String(sc.id) === String(currentId));

        // 2) fallback: match by name
        if (!current && item.category_name) {
          const target = String(item.category_name).trim().toLowerCase();
          current = res.data.find(sc =>
            String(sc.name ?? '').trim().toLowerCase() === target ||
            formatSubCategory(sc).formattedName?.trim().toLowerCase() === target
          );
        }
        // 3) last resort: the sub-category is not in the loaded list (e.g. the list
        //    is paginated/limited). Build the option from the item itself so the
        //    saved sub-category is still shown and kept on save.
        if (!current && currentId != null && currentId !== '') {
          console.warn('Sub-category', currentId, 'not found in getAllSubCategories() result (', res.data.length, 'loaded )');
          current = {
            id: currentId,
            name: item.category_name,
            displayLabel: item.category_name || `Sub-category #${currentId}`,
            _fallback: true,
          };
        }
        // The input shows renderName(value) = value.displayLabel, so the
        // preselected object must carry displayLabel just like dropdown options do.
        if (current && !current.displayLabel) {
          current = {
            ...current,
            displayLabel: `${current.main_category_name || 'Unknown'} → ${formatSubCategory(current).formattedName}`,
          };
        }
        if (current) setSelectedSub(current);
      } else {
        toast.error('Could not load sub-categories');
      }
      setSubCatLoading(false);
    });
    return () => { cancelled = true; };
  }, [item.category]);

  const loadedOptions = subCategories.map(sc => {
    const f = formatSubCategory(sc);
    return { ...sc, displayLabel: `${sc.main_category_name || 'Unknown'} → ${f.formattedName}` };
  });
  // Keep the fallback option in the list so it can be shown/selected.
  const subCatOptions = selectedSub?._fallback ? [selectedSub, ...loadedOptions] : loadedOptions;

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
    toast.loading('Updating item...', { id: 'update-item' });
    const res = await updateItem(
      item.id,
      word.trim(),
      speakAs,
      color.value,
      imageFile,
      audioFile,
      true,
      lang,
      effectiveBuddyMode,
      selectedSub.id
    );
    if (!res.success) {
      toast.error(res.message, { id: 'update-item' });
      setSubmitting(false);
      return;
    }

    toast.success('Item updated! ✓', { id: 'update-item' });
    setSubmitting(false);
    onDone();
  };

  const inputClass =
    'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Edit Item</h2>
      <p className="text-sm text-gray-400 mb-6">Update this item or move it to another sub-category.</p>

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
            className={inputClass}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Speak As <span className="text-gray-400 font-normal normal-case">(optional — overrides TTS pronunciation)</span>
          </p>
          <input
            type="text" value={speakAs} onChange={e => setSpeakAs(e.target.value)}
            placeholder="e.g. 'Ap-uhl' for unusual pronunciations"
            className={inputClass}
          />
        </div>

        <ColorPicker selected={color} onSelect={setColor} />

        <BuddyModeToggle
          value={effectiveBuddyMode}
          onChange={setBuddyMode}
          locked={parentBuddyLocked}
          lockedReason={parentBuddyMode ? 'Parent sub-category has Buddy Mode ON' : undefined}
        />

        <ImageUploadField imagePreview={imagePreview} onChange={handleImageChange} label="Icon" />

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Custom Audio <span className="text-gray-400 font-normal normal-case">(optional — device TTS used if not provided)</span>
          </p>
          <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl">
            {audioFile
              ? <p className="text-sm text-green-600 font-medium">✓ {audioFile.name}</p>
              : formatted.hasAudio
                ? <p className="text-sm text-gray-500">Existing custom audio on file</p>
                : <p className="text-sm text-gray-400">No file selected</p>
            }
            <label className="cursor-pointer text-sm font-semibold text-amber-600 hover:text-amber-500 ml-auto">
              <span>Upload audio</span>
              <input type="file" className="sr-only" onChange={handleAudioChange} accept="audio/mpeg, audio/wav, audio/mp3" />
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button" onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={submitting || !selectedSub}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors"
          >
            {submitting ? <><Spinner sm /> Updating...</> : '✓ Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}