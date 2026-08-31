"use client";
import { updateCategory } from '@/components/lib/categoryApiClient';
import React, { useState } from 'react';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
];

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13h-2.5z" />
    <path d="M9 13h2v5H9v-5z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const LanguageSelector = ({ value, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
    <div className="flex gap-2">
      {LANGUAGE_OPTIONS.map(lang => (
        <button
          key={lang.value}
          type="button"
          onClick={() => onChange(lang.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
            value === lang.value
              ? 'bg-amber-400 border-amber-400 text-gray-900 shadow-sm'
              : 'bg-white border-gray-300 text-gray-600 hover:border-amber-300 hover:bg-amber-50'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  </div>
);

const BuddyModeToggle = ({ value, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">Buddy Mode</label>
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
          value ? 'bg-amber-400' : 'bg-gray-300'
        }`}
        aria-checked={value}
        role="switch"
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-sm font-semibold ${value ? 'text-amber-700' : 'text-gray-500'}`}>
        {value ? 'Buddy Mode ON' : 'Buddy Mode OFF'}
      </span>
    </div>
  </div>
);

const EditCategory = ({ category, onUpdateCategory, onCancel }) => {
  const existingLang = Object.keys(category.translations || {})[0] || 'en';
  const existingName = category.translations?.[existingLang]?.name || category.name || '';

  const [categoryName, setCategoryName] = useState(existingName);
  const [color, setColor] = useState(category.color || '#FF5733');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(category.image_icon || '');
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState(existingLang);
  const [buddyMode, setBuddyMode] = useState(category.buddy_mode || false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return; }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { setError('Audio size must be less than 10MB'); return; }
      setAudio(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) { setError('Category name is required'); return; }
    setLoading(true);
    try {
      const response = await updateCategory(category.id, categoryName, color, image, audio, true, lang, buddyMode);
      if (response.success) {
        onUpdateCategory(response.data);
      } else {
        setError(response.message || 'Failed to update category');
      }
    } catch (err) {
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-xl shadow-lg max-w-2xl mx-auto bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Category</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <LanguageSelector value={lang} onChange={setLang} />

        <div className="mb-6">
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text" id="categoryName" value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Type category name"
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition placeholder-gray-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex items-center gap-3">
            <input type="color" id="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer" />
            <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 font-mono" placeholder="#FF5733" />
          </div>
        </div>

        <BuddyModeToggle value={buddyMode} onChange={setBuddyMode} />

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Image/Icon</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {imagePreview
                ? <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
                : <UploadIcon />
              }
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload-edit" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                  <span>Upload Image</span>
                  <input id="file-upload-edit" type="file" className="sr-only"
                    onChange={handleImageChange} accept="image/jpeg, image/png" />
                </label>
              </div>
              <p className="text-xs text-gray-500">JPG or PNG, at least 100×100px, max 5MB</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speak Audio <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {audio
                ? <p className="text-sm text-green-600 font-medium">✓ {audio.name}</p>
                : <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
              }
              <div className="flex text-sm text-gray-600">
                <label htmlFor="audio-upload-edit" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                  <span>Upload Audio</span>
                  <input id="audio-upload-edit" type="file" className="sr-only"
                    onChange={handleAudioChange} accept="audio/mpeg, audio/wav, audio/mp3" />
                </label>
              </div>
              <p className="text-xs text-gray-500">MP3 or WAV, max 10MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-start gap-4">
          <button type="button" onClick={onCancel} disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-400 text-gray-800 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition disabled:opacity-50">
            {loading && <LoadingSpinner />}
            {loading ? 'Updating...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;