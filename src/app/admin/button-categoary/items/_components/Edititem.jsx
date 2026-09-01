"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { updateItem, formatItem } from '@/components/lib/categoryItemsApiClient';
import { COLORS } from '@/components/shared/constants';
import { Spinner } from '../../sub-cetegoary/_components/shared/Icons';
import { ColorPicker } from '@mantine/core';
import { BuddyModeToggle, ImageUploadField, LangPills } from '../../sub-cetegoary/_components/shared/ui';

export default function EditItem({ item, onDone, onCancel }) {
  const existingLang = Object.keys(item.translations || {})[0] || 'en';
  const formatted = formatItem(item, existingLang);
  const existingColor = COLORS.find(c => c.value === item.color) || COLORS[0];

  const [word, setWord] = useState(formatted.formattedWord);
  const [speakAs, setSpeakAs] = useState(item.translations?.[existingLang]?.speak_as || '');
  const [lang, setLang] = useState(existingLang);
  const [color, setColor] = useState(existingColor);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image_icon || '');
  const [audioFile, setAudioFile] = useState(null);
  const [buddyMode, setBuddyMode] = useState(item.buddy_mode || false);
  const [submitting, setSubmitting] = useState(false);

  const imagePreviewUrlRef = useRef('');
  useEffect(() => () => {
    if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
  }, []);

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
    if (!word.trim()) { toast.error('Item word is required'); return; }

    setSubmitting(true);
    toast.loading('Updating item...', { id: 'update-item' });
    const res = await updateItem(
      item.id, word.trim(), speakAs, color.value, imageFile, audioFile, true, lang, buddyMode
    );
    if (!res.success) { toast.error(res.message, { id: 'update-item' }); setSubmitting(false); return; }

    toast.success('Item updated! ✓', { id: 'update-item' });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Edit Item</h2>
      <p className="text-sm text-gray-400 mb-6">
        Under <span className="font-semibold text-gray-600">{item.category_name || 'Unknown sub-category'}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <BuddyModeToggle value={buddyMode} onChange={setBuddyMode} locked={false} />

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