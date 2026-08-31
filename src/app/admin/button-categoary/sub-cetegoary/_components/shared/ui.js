"use client";
import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGE_OPTIONS, COLORS } from './Constants';
import { UploadIcon, LoadingSpinner } from './Icons';

// ─── SMART DROPDOWN ────────────────────────────────────────────────────────
// A searchable single-select dropdown. `options` is an array of arbitrary
// objects; `renderName(option)` returns the label to show/search against.
export const SmartDropdown = ({ label, value, options, onSelect, placeholder = 'Select...', loading = false, renderName }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(o => renderName(o).toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={containerRef} className="relative">
      {label && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-left focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
      >
        <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {value ? renderName(value) : placeholder}
        </span>
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm bg-gray-50 rounded-lg outline-none"
            />
          </div>
          <div className="overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6"><LoadingSpinner /></div>
            ) : filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { onSelect(opt); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors ${
                    value?.id === opt.id ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  {renderName(opt)}
                </button>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-gray-300 text-center">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── COLOR PICKER ──────────────────────────────────────────────────────────
export const ColorPicker = ({ selected, onSelect }) => {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</p>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            onClick={() => onSelect(c)}
            className={`h-9 w-9 rounded-full border-2 transition-all ${
              selected?.value === c.value ? 'border-amber-500 scale-110 shadow-md' : 'border-white shadow-sm hover:scale-105'
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── BUDDY MODE TOGGLE ─────────────────────────────────────────────────────
export const BuddyModeToggle = ({ value, onChange, locked = false, lockedReason }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
      Buddy Mode
      {locked && <span className="text-amber-600 font-normal normal-case bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">🔒 Inherited</span>}
    </p>
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${locked ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
      <button
        type="button"
        onClick={() => !locked && onChange(!value)}
        disabled={locked}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
          value ? 'bg-amber-400' : 'bg-gray-300'
        } ${locked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <div>
        <span className={`text-sm font-semibold ${value ? 'text-amber-700' : 'text-gray-500'}`}>
          {value ? 'ON' : 'OFF'}
        </span>
        {locked && lockedReason && <p className="text-xs text-amber-600 mt-0.5">{lockedReason}</p>}
      </div>
    </div>
  </div>
);

// ─── LANGUAGE PILLS ────────────────────────────────────────────────────────
export const LangPills = ({ value, onChange }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</p>
    <div className="flex gap-2">
      {LANGUAGE_OPTIONS.map((lang) => (
        <button
          key={lang.value}
          type="button"
          onClick={() => onChange(lang.value)}
          className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
            value === lang.value
              ? 'bg-amber-400 border-amber-400 text-gray-900'
              : 'bg-white border-gray-200 text-gray-500 hover:border-amber-300 hover:bg-amber-50'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  </div>
);

// ─── IMAGE UPLOAD FIELD ────────────────────────────────────────────────────
export const ImageUploadField = ({ imagePreview, onChange, label = 'Icon' }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
    <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl">
      {imagePreview
        ? <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
        : <div className="h-16 w-16 flex items-center justify-center bg-gray-50 rounded-lg"><UploadIcon /></div>
      }
      <label className="cursor-pointer text-sm font-semibold text-amber-600 hover:text-amber-500">
        <span>Upload image</span>
        <input type="file" className="sr-only" onChange={onChange} accept="image/jpeg, image/png" />
      </label>
    </div>
  </div>
);