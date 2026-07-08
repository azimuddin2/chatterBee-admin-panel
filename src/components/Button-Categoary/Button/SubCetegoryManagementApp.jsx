"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { API_ENDPOINTS } from '@/components/lib/api';
import {
  getSubCategoriesByParent,
  createSubCategory,
} from '@/components/lib/subCategoriesApiClient';
import {
  getItemsBySubCategory,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  formatItem
} from '@/components/lib/categoryItemsApiClient';

// ─── LANGUAGE OPTIONS ─────────────────────────────────────────
const LANGUAGE_OPTIONS = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
];

// ─── TOKEN ───────────────────────────────────────────────────
const getToken = () => {
  if (typeof document === 'undefined') return null;
  const c = document.cookie.split('; ').find(r => r.startsWith('token='));
  return c ? c.substring(6) : null;
};

// ─── FETCH MAIN CATEGORIES ───────────────────────────────────
const fetchRootCategories = async () => {
  const token = getToken();
  if (!token) return { success: false, data: [], message: 'No token' };
  try {
    const res = await fetch(`${API_ENDPOINTS.CATEGORIES.GET_ALL_ROOT_CATEGORIES}?lang=en`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) return { success: false, data: [], message: data.message || 'Failed' };
    return { success: true, data: data.data || [] };
  } catch (e) {
    return { success: false, data: [], message: e.message };
  }
};

// ─── COLORS ──────────────────────────────────────────────────
const COLORS = [
  { name: 'Gold',        value: '#FDD268' },
  { name: 'Cream',       value: '#FFF8E6' },
  { name: 'Light Pink',  value: '#FFE2DE' },
  { name: 'Powder Blue', value: '#DDF2F5' },
  { name: 'Lavender',    value: '#E8E8F6' },
  { name: 'Mint Green',  value: '#E7F5E3' },
];

// ─── ICONS ───────────────────────────────────────────────────
const ChevronDown = () => (
  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
const Spinner = ({ sm }) => (
  <svg className={`animate-spin ${sm ? 'h-4 w-4' : 'h-5 w-5'}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
const PlusIcon = () => (
  <svg className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const UploadIcon = () => (
  <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
// New: icon for "Skip" sub-category mode
const SkipIcon = () => (
  <svg className="h-3.5 w-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" clipRule="evenodd" />
  </svg>
);

// ─── GET CATEGORY DISPLAY NAME ────────────────────────────────
const getCatName = (cat) => {
  if (!cat) return '';
  const t = cat.translations;
  if (!t) return cat.name || '';
  return t.en?.name || t.es?.name || Object.values(t)[0]?.name || cat.name || '';
};

// ─── BUDDY MODE TOGGLE ────────────────────────────────────────
const BuddyModeToggle = ({ value, onChange, locked, lockedReason }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
      Buddy Mode
      {locked && (
        <span className="normal-case text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          🔒 Inherited
        </span>
      )}
    </p>
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${locked ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
      <button
        type="button"
        onClick={() => !locked && onChange(!value)}
        disabled={locked}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value ? 'bg-amber-400' : 'bg-gray-300'
        } ${locked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <div>
        <span className={`text-sm font-semibold ${value ? 'text-amber-700' : 'text-gray-500'}`}>
          {value ? 'Buddy Mode ON' : 'Buddy Mode OFF'}
        </span>
        {locked && lockedReason && <p className="text-xs text-amber-600 mt-0.5">{lockedReason}</p>}
      </div>
    </div>
  </div>
);

// ─── LANGUAGE SELECTOR (compact pill) ────────────────────────
const LangPills = ({ value, onChange }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</p>
    <div className="flex gap-2">
      {LANGUAGE_OPTIONS.map(lang => (
        <button
          key={lang.value}
          type="button"
          onClick={() => onChange(lang.value)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
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

// ─── SMART DROPDOWN ───────────────────────────────────────────
const SmartDropdown = ({ label, value, options, onSelect, placeholder, loading: dropLoading, renderName }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const getName = renderName || ((opt) => opt.name || opt.word || '');

  return (
    <div className="relative" ref={ref}>
      {label && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm hover:border-amber-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={value ? 'text-gray-800 font-medium truncate' : 'text-gray-400'}>
            {dropLoading ? 'Loading...' : (value ? getName(value) : placeholder)}
          </span>
          {value?.buddy_mode && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold border border-amber-200">Buddy</span>
          )}
        </div>
        {dropLoading ? <Spinner sm /> : <ChevronDown />}
      </button>
      {open && !dropLoading && (
        <div className="absolute z-40 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {options.length === 0
              ? <p className="px-4 py-3 text-sm text-gray-400 text-center">Nothing here yet</p>
              : options.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { onSelect(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-amber-50 transition-colors ${value?.id === opt.id ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-700'}`}
                >
                  {value?.id === opt.id && <CheckIcon />}
                  <span className={value?.id === opt.id ? '' : 'ml-5'}>{getName(opt)}</span>
                  {opt.buddy_mode && (
                    <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold border border-amber-200">Buddy</span>
                  )}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

// ─── COLOR PICKER ─────────────────────────────────────────────
const ColorPicker = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color *</p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm hover:border-amber-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-5 rounded-full border border-gray-200 shadow-sm flex-shrink-0" style={{ backgroundColor: selected?.value }} />
          <span className="text-gray-800 font-medium">{selected?.name || 'Pick a color'}</span>
        </div>
        <ChevronDown />
      </button>
      {open && (
        <div className="absolute z-40 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => { onSelect(c); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-amber-50 transition-colors ${selected?.value === c.value ? 'bg-amber-50' : ''}`}
            >
              <span className="h-5 w-5 rounded-full border border-gray-200 shadow-sm flex-shrink-0" style={{ backgroundColor: c.value }} />
              <span className={`text-sm ${selected?.value === c.value ? 'font-semibold text-amber-700' : 'text-gray-700'}`}>{c.name}</span>
              {selected?.value === c.value && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── STEP BREADCRUMB ──────────────────────────────────────────
const StepBreadcrumb = ({ mainCat, subCat, activeStep }) => {
  const steps = [
    { id: 1, label: 'Main Category', value: mainCat ? getCatName(mainCat) : null, emoji: '📁' },
    {
      id: 2,
      label: 'Sub-Category',
      value: subCat
        ? (subCat.direct ? 'No Sub-folder' : subCat.isNew ? `New: "${subCat.name}"` : getCatName(subCat))
        : null,
      emoji: '📂'
    },
    { id: 3, label: 'Item Details',  value: null, emoji: '🏷️' },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            activeStep === step.id
              ? 'bg-amber-400 border-amber-400 text-gray-900 shadow-sm'
              : activeStep > step.id && step.value
              ? 'bg-gray-900 border-gray-900 text-white'
              : 'bg-white border-gray-200 text-gray-400'
          }`}>
            <span>{step.emoji}</span>
            <span>{step.value || step.label}</span>
            {activeStep > step.id && step.value && <span className="ml-0.5 opacity-70"><CheckIcon /></span>}
          </div>
          {i < steps.length - 1 && (
            <svg className={`h-3 w-3 flex-shrink-0 ${activeStep > step.id ? 'text-gray-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── ADD FORM (3 steps) ────────────────────────────────────────
const AddForm = ({ onDone, onCancel }) => {
  const [step, setStep] = useState(1);

  // Step 1
  const [mainCategories, setMainCategories] = useState([]);
  const [mainCatLoading, setMainCatLoading] = useState(false);
  const [selectedMain, setSelectedMain] = useState(null);

  // Step 2
  const [subCategories, setSubCategories] = useState([]);
  const [subCatLoading, setSubCatLoading] = useState(false);
  // 'existing' -> pick a subcategory that already exists
  // 'new'      -> create a brand-new subcategory
  // 'skip'     -> NO subcategory at all — item attaches directly to the main category
  const [subCatMode, setSubCatMode] = useState('skip');
  const [selectedSub, setSelectedSub] = useState(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubLang, setNewSubLang] = useState('en');
  const [newSubBuddyMode, setNewSubBuddyMode] = useState(false);

  // Step 3
  const [word, setWord] = useState('');
  const [lang, setLang] = useState('en');
  const [color, setColor] = useState(COLORS[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [buddyMode, setBuddyMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Full two-way buddy mode inheritance
  const parentBuddyMode = selectedMain?.buddy_mode ?? false;
  const parentBuddyLocked = selectedMain !== null;
  const subEffectiveBuddyMode = parentBuddyLocked ? parentBuddyMode : newSubBuddyMode;

  // When skipping the sub-category step entirely, the item inherits straight
  // from the main category — there's no intermediate layer to lock against.
  const subParentBuddyMode = subCatMode === 'existing'
    ? (selectedSub?.buddy_mode ?? false)
    : subCatMode === 'skip'
      ? parentBuddyMode
      : subEffectiveBuddyMode;
  const subParentLocked = subCatMode === 'existing'
    ? selectedSub !== null
    : subCatMode === 'skip'
      ? parentBuddyLocked
      : parentBuddyLocked;
  const itemEffectiveBuddyMode = subParentLocked ? subParentBuddyMode : buddyMode;

  const handleAudioChange = (e) => {
    const f = e.target.files[0];
    if (f) { setAudioFile(f); setAudioFileName(f.name); }
  };

  const removeAudio = () => { setAudioFile(null); setAudioFileName(''); };

  useEffect(() => {
    setMainCatLoading(true);
    fetchRootCategories().then(res => {
      if (res.success) setMainCategories(res.data);
      else toast.error('Could not load main categories');
      setMainCatLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedMain) return;
    setSubCatLoading(true);
    setSelectedSub(null);
    setSubCategories([]);
    getSubCategoriesByParent(selectedMain.id).then(res => {
      if (res.success) {
        setSubCategories(res.data);
        // Default: if sub-categories already exist, show them.
        // If none exist, don't force creating one — default to "skip"
        // so buttons can be added straight under the main category.
        setSubCatMode(res.data.length > 0 ? 'existing' : 'skip');
        if (res.data.length > 0) setSelectedSub(res.data[0]);
      }
      setSubCatLoading(false);
    });
    if (selectedMain.buddy_mode) setNewSubBuddyMode(true);
  }, [selectedMain]);

  useEffect(() => {
    if (selectedSub?.buddy_mode) setBuddyMode(true);
  }, [selectedSub]);

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const goToStep2 = () => {
    if (!selectedMain) { toast.error('Please select a main category'); return; }
    setStep(2);
  };

  const goToStep3 = () => {
    if (subCatMode === 'existing' && !selectedSub) { toast.error('Please select a sub-category'); return; }
    if (subCatMode === 'new' && !newSubName.trim()) { toast.error('Enter a sub-category name'); return; }
    // 'skip' needs no validation — nothing to pick or create
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) { toast.error('Word is required'); return; }
    // ✅ Audio is NOT required — TTS will be used if no audio file
    setSubmitting(true);

    let subCategoryId;
    // NOTE: when subCatMode === 'skip' we pass the MAIN category's id
    // straight through as the item's parent id (isDirectToCategory = true).
    // createItem()/the backend needs to accept a main-category id here
    // instead of requiring a row in the sub_categories table — if your
    // API only accepts a sub_category_id today, this flag tells it to
    // treat the id as a category id instead. Update categoryItemsApiClient.js
    // + the backend endpoint to honor this flag if it doesn't already.
    let isDirectToCategory = false;

    if (subCatMode === 'new') {
      toast.loading('Creating sub-category...', { id: 'save' });
      const res = await createSubCategory(
        selectedMain.id, newSubName.trim(), '#FF5733', null, null, true, newSubLang, subEffectiveBuddyMode
      );
      if (!res.success) { toast.error(res.message, { id: 'save' }); setSubmitting(false); return; }
      subCategoryId = res.data?.id;
      if (!subCategoryId) { toast.error('Could not get sub-category ID', { id: 'save' }); setSubmitting(false); return; }
    } else if (subCatMode === 'skip') {
      subCategoryId = selectedMain.id;
      isDirectToCategory = true;
    } else {
      subCategoryId = selectedSub.id;
    }

    toast.loading('Creating item...', { id: 'save' });
    // audioFile can be null — backend accepts it, app will use TTS
    const itemRes = await createItem(
      subCategoryId, word.trim(), '', color.value, imageFile, audioFile, true, lang, itemEffectiveBuddyMode, isDirectToCategory
    );
    if (!itemRes.success) { toast.error(itemRes.message, { id: 'save' }); setSubmitting(false); return; }

    toast.success('All done! 🎉', { id: 'save' });
    setSubmitting(false);
    onDone();
  };

  const subCatForCrumb = step >= 3
    ? (subCatMode === 'new'
        ? { name: newSubName, isNew: true }
        : subCatMode === 'skip'
          ? { direct: true }
          : selectedSub)
    : null;

  // Only show "Use Existing" as an option when sub-categories actually exist
  const subCatModeOptions = subCategories.length > 0
    ? ['existing', 'new', 'skip']
    : ['new', 'skip'];

  const subCatModeMeta = {
    existing: { label: '📂 Use Existing' },
    new:      { label: '✨ Create New' },
    skip:     { label: (<><SkipIcon />Skip — No Sub-Folder</>) },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <StepBreadcrumb mainCat={selectedMain} subCat={subCatForCrumb} activeStep={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Choose Main Category</h2>
          <p className="text-sm text-gray-400 mb-6">Which top-level category does this belong to?</p>
          <SmartDropdown
            value={selectedMain}
            options={mainCategories}
            onSelect={setSelectedMain}
            placeholder="Select a main category..."
            loading={mainCatLoading}
            renderName={getCatName}
          />
          {selectedMain?.buddy_mode && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <span>🔒</span>
              <span>This category has Buddy Mode ON — sub-categories and items will inherit it.</span>
            </div>
          )}
          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" onClick={goToStep2} disabled={!selectedMain || mainCatLoading}
              className="flex-1 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors">Next →</button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sub-Category</h2>
          <p className="text-sm text-gray-400 mb-6">
            Optional — pick an existing one under <span className="font-semibold text-gray-700">{getCatName(selectedMain)}</span>, create a new one, or skip it entirely.
          </p>
          <div className="flex gap-2 mb-4 flex-wrap">
            {subCatModeOptions.map(m => (
              <button key={m} type="button" onClick={() => setSubCatMode(m)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide transition-all ${
                  subCatMode === m ? 'bg-amber-400 border-amber-400 text-gray-900' : 'bg-white border-gray-200 text-gray-400 hover:border-amber-300'
                }`}>
                {subCatModeMeta[m].label}
              </button>
            ))}
          </div>

          {subCatMode === 'existing' && (
            <SmartDropdown value={selectedSub} options={subCategories} onSelect={setSelectedSub}
              placeholder="Select sub-category..." loading={subCatLoading} renderName={getCatName} />
          )}

          {subCatMode === 'new' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New Sub-Category Name</p>
                <input type="text" value={newSubName} onChange={e => setNewSubName(e.target.value)}
                  placeholder="e.g. Animals, Colors, Food..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>
              <LangPills value={newSubLang} onChange={setNewSubLang} />
              <BuddyModeToggle value={subEffectiveBuddyMode} onChange={setNewSubBuddyMode} locked={parentBuddyLocked}
                lockedReason={parentBuddyMode ? "Parent has Buddy Mode ON" : "Parent has Buddy Mode OFF"} />
            </div>
          )}

          {subCatMode === 'skip' && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-xl leading-none">⏭️</span>
              <div>
                <p className="text-sm font-semibold text-gray-700">No sub-folder for this item</p>
                <p className="text-xs text-gray-400 mt-1">
                  The button will show up directly under <span className="font-semibold text-gray-600">{getCatName(selectedMain)}</span> when a user opens that category — no extra folder in between.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">← Back</button>
            <button type="button" onClick={goToStep3} className="flex-1 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 rounded-xl text-sm font-bold text-gray-900 transition-colors">
              {subCatMode === 'skip' ? 'Skip →' : 'Next →'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Item Details</h2>
          <p className="text-sm text-gray-400 mb-6">Fill in the button/item info.</p>

          <div className="space-y-5">
            <LangPills value={lang} onChange={setLang} />

            {/* Word */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Word *</p>
              <input type="text" value={word} onChange={e => setWord(e.target.value)} placeholder="Type the word"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>

            {/* ── AUDIO — OPTIONAL with TTS notice ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Speak Audio <span className="normal-case font-normal text-gray-400">(Optional)</span>
              </p>
              <p className="text-xs text-blue-500 mb-2">
                💬 No audio? Device TTS will speak the word automatically.
              </p>
              {audioFileName ? (
                <div className="flex items-center gap-4 p-4 border border-amber-200 bg-amber-50 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{audioFileName}</p>
                    <p className="text-xs text-gray-400">Custom audio ready</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <label className="cursor-pointer text-xs font-bold text-amber-600 hover:text-amber-700">
                      Change
                      <input type="file" className="sr-only" onChange={handleAudioChange} accept="audio/*,.mp3,.wav,.ogg,.m4a" />
                    </label>
                    <button type="button" onClick={removeAudio} className="text-xs font-bold text-red-400 hover:text-red-600">Remove</button>
                  </div>
                </div>
              ) : (
                <label className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer transition-all group">
                  <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 group-hover:text-amber-600 transition-colors">Upload custom audio (optional)</p>
                    <p className="text-xs text-gray-400">MP3, WAV, M4A — max 10MB</p>
                  </div>
                  <input type="file" className="sr-only" onChange={handleAudioChange} accept="audio/*,.mp3,.wav,.ogg,.m4a" />
                </label>
              )}
            </div>

            <ColorPicker selected={color} onSelect={setColor} />

            <BuddyModeToggle value={itemEffectiveBuddyMode} onChange={setBuddyMode} locked={subParentLocked}
              lockedReason={subParentBuddyMode ? "Parent has Buddy Mode ON" : "Parent has Buddy Mode OFF"} />

            {/* Image */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Image / Icon <span className="normal-case font-normal text-gray-400">(optional)</span></p>
              {imagePreview ? (
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                  <img src={imagePreview} alt="preview" className="h-14 w-14 object-cover rounded-lg border border-gray-100" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Image selected</p>
                    <label className="cursor-pointer text-xs font-semibold text-amber-600 hover:text-amber-700">
                      Change image
                      <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-amber-300 cursor-pointer transition-colors group">
                  <UploadIcon />
                  <span className="text-sm font-medium text-gray-400 group-hover:text-amber-500 transition-colors">Click to upload</span>
                  <span className="text-xs text-gray-300">JPG or PNG, max 5MB</span>
                  <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">← Back</button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors">
              {submitting ? <><Spinner sm /> Creating...</> : '✓ Create Item'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ─── EDIT FORM ────────────────────────────────────────────────
const EditForm = ({ item, onDone, onCancel }) => {
  const existingLang = Object.keys(item.translations || {})[0] || 'en';
  const existingWord = item.translations?.[existingLang]?.word || item.word || '';
  const existingAudioUrl = item.translations?.[existingLang]?.speak || null;

  const [word, setWord] = useState(existingWord);
  const [lang, setLang] = useState(existingLang);
  const [color, setColor] = useState(COLORS.find(c => c.value === item?.color) || COLORS[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image_icon || '');
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [buddyMode, setBuddyMode] = useState(item?.buddy_mode || false);
  const [submitting, setSubmitting] = useState(false);

  const parentBuddyLocked = item.subCategoryBuddyMode || false;
  const effectiveBuddyMode = parentBuddyLocked ? true : buddyMode;

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
  };
  const handleAudioChange = (e) => {
    const f = e.target.files[0];
    if (f) { setAudioFile(f); setAudioFileName(f.name); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) { toast.error('Word is required'); return; }
    // ✅ Audio NOT required — existing audio stays, or TTS will be used
    setSubmitting(true);
    toast.loading('Updating...', { id: 'edit' });
    const res = await updateItem(item.id, word.trim(), '', color.value, imageFile, audioFile, true, lang, effectiveBuddyMode);
    if (!res.success) { toast.error(res.message, { id: 'edit' }); setSubmitting(false); return; }
    toast.success('Item updated!', { id: 'edit' });
    setSubmitting(false);
    onDone();
  };

  // Hide the "Sub" crumb entirely for items that live directly under a main category
  const crumbSteps = [
    { emoji: '📁', label: item.mainCategoryName || 'Main' },
    ...(item.subCategoryName ? [{ emoji: '📂', label: item.subCategoryName }] : []),
    { emoji: '✏️', label: `Editing: ${existingWord}` },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-1.5 flex-wrap mb-8">
        {crumbSteps.map((t, i, arr) => (
          <React.Fragment key={i}>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${i === arr.length - 1 ? 'bg-amber-400 border-amber-400 text-gray-900' : 'bg-gray-900 border-gray-900 text-white'}`}>
              {t.emoji} {t.label}
            </span>
            {i < arr.length - 1 && (
              <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-1">Edit Item</h2>
      <p className="text-sm text-gray-400 mb-6">Update the details below.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <LangPills value={lang} onChange={setLang} />

        {/* Word */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Word *</p>
          <input type="text" value={word} onChange={e => setWord(e.target.value)} placeholder="Type the word"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
        </div>

        {/* ── AUDIO — OPTIONAL with TTS notice ── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Speak Audio <span className="normal-case font-normal text-gray-400">(Optional)</span>
          </p>
          <p className="text-xs text-blue-500 mb-2">
            💬 No audio? Device TTS will speak the word automatically.
          </p>
          {audioFileName ? (
            <div className="flex items-center gap-4 p-4 border border-amber-200 bg-amber-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{audioFileName}</p>
                <p className="text-xs text-gray-400">New audio ready</p>
              </div>
              <label className="cursor-pointer text-xs font-bold text-amber-600 hover:text-amber-700">
                Change
                <input type="file" className="sr-only" onChange={handleAudioChange} accept="audio/*,.mp3,.wav,.ogg,.m4a" />
              </label>
            </div>
          ) : existingAudioUrl ? (
            <div className="flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700">Custom audio file exists</p>
                <p className="text-xs text-gray-400">Upload a new file to replace it</p>
              </div>
              <label className="cursor-pointer text-xs font-bold text-amber-600 hover:text-amber-700 flex-shrink-0">
                Replace
                <input type="file" className="sr-only" onChange={handleAudioChange} accept="audio/*,.mp3,.wav,.ogg,.m4a" />
              </label>
            </div>
          ) : (
            <label className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer transition-all group">
              <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 group-hover:text-amber-600 transition-colors">Upload custom audio (optional)</p>
                <p className="text-xs text-gray-400">MP3, WAV, M4A — max 10MB</p>
              </div>
              <input type="file" className="sr-only" onChange={handleAudioChange} accept="audio/*,.mp3,.wav,.ogg,.m4a" />
            </label>
          )}
        </div>

        <ColorPicker selected={color} onSelect={setColor} />

        <BuddyModeToggle value={effectiveBuddyMode} onChange={setBuddyMode} locked={parentBuddyLocked}
          lockedReason="Parent has Buddy Mode ON — item must also be ON" />

        {/* Image */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Image / Icon <span className="normal-case font-normal text-gray-400">(optional)</span></p>
          {imagePreview ? (
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
              <img src={imagePreview} alt="preview" className="h-14 w-14 object-cover rounded-lg border border-gray-100" />
              <label className="cursor-pointer text-xs font-semibold text-amber-600 hover:text-amber-700">
                Change image
                <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-amber-300 cursor-pointer transition-colors group">
              <UploadIcon />
              <span className="text-sm font-medium text-gray-400 group-hover:text-amber-500 transition-colors">Click to upload</span>
              <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors">
            {submitting ? <><Spinner sm /> Saving...</> : '✓ Update Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── TTS PREVIEW BUTTON ──────────────────────────────────────
const TTSPreviewButton = ({ word }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      title={speaking ? 'Stop TTS' : `Preview TTS: "${word}"`}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        speaking
          ? 'bg-blue-400 text-white shadow-sm scale-95'
          : 'bg-blue-50 text-blue-500 border border-blue-100 hover:bg-blue-100 hover:text-blue-700'
      }`}
    >
      {speaking ? (
        <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
      )}
      {speaking ? 'Stop' : '🔊 TTS'}
    </button>
  );
};

// ─── AUDIO PLAY BUTTON ───────────────────────────────────────
const AudioPlayButton = ({ src, playingId, itemId, onPlay }) => {
  const isPlaying = playingId === itemId;
  return (
    <button
      onClick={() => onPlay(itemId, src)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        isPlaying ? 'bg-amber-400 text-gray-900 shadow-sm scale-95' : 'bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-700'
      }`}
      title={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )}
      {isPlaying ? 'Playing…' : 'Play'}
    </button>
  );
};

// ─── ITEMS TABLE ──────────────────────────────────────────────
const ItemsTable = ({ items, onEdit, onDelete, loading, searchQuery, onSearchChange }) => {
  const filtered = searchItems(items, searchQuery);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  const handlePlay = (itemId, src) => {
    if (playingId === itemId) { audioRef.current?.pause(); setPlayingId(null); return; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(src);
    audio.play().catch(() => toast.error('Could not play audio'));
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => { toast.error('Audio failed to load'); setPlayingId(null); };
    audioRef.current = audio;
    setPlayingId(itemId);
  };

  useEffect(() => { return () => { audioRef.current?.pause(); }; }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">All Items</h2>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} total</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl w-56">
          <SearchIcon />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => onSearchChange(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Path</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Word</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Lang</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Audio</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Image</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Color</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Buddy</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? filtered.map(item => {
                const fmt = formatItem(item);
                const langs = Object.keys(item.translations || {});
                const audioUrl = langs.map(l => item.translations[l]?.speak).find(s => s && (s.startsWith('http') || s.startsWith('/'))) || null;

                return (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">{item.mainCategoryName || '—'}</span>
                        {item.subCategoryName && (
                          <>
                            <svg className="h-2.5 w-2.5 text-gray-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full font-semibold border border-amber-100">{item.subCategoryName}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{fmt.formattedWord}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {langs.map(l => (
                          <span key={l} className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">{l}</span>
                        ))}
                      </div>
                    </td>
                    {/* Audio — shows custom audio or TTS indicator */}
                    <td className="px-6 py-4 flex items-center justify-center">
                      {audioUrl
                        ? <AudioPlayButton src={audioUrl} itemId={item.id} playingId={playingId} onPlay={handlePlay} />
                        : <TTSPreviewButton word={item.word || fmt.formattedWord} />
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      {fmt.hasImage
                        ? <img src={item.image_icon} alt={fmt.formattedWord} className="h-9 w-9 mx-auto object-cover rounded-lg border border-gray-100" />
                        : <span className="text-gray-200 text-xs">—</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-7 w-7 mx-auto rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: fmt.displayColor }} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.buddy_mode ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.buddy_mode ? 'bg-amber-500' : 'bg-gray-400'}`} />
                        {item.buddy_mode ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => onEdit(item)} className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => onDelete(item.id, fmt.formattedWord)} className="px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-gray-300 text-sm">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No items yet — hit Add Item to get started'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────
export default function SubCategoryManagement() {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const mainRes = await fetchRootCategories();
    if (!mainRes.success || mainRes.data.length === 0) { setLoading(false); return; }

    const subResults = await Promise.all(
      mainRes.data.map(mc =>
        getSubCategoriesByParent(mc.id).then(r => ({
          mainCategoryId: mc.id,
          mainCategoryName: getCatName(mc),
          mainBuddyMode: mc.buddy_mode || false,
          subs: r.success ? r.data : []
        }))
      )
    );

    // Items nested under real sub-categories
    const subItemResults = await Promise.all(
      subResults.flatMap(r =>
        r.subs.map(sc =>
          getItemsBySubCategory(sc.id).then(ir => ({
            mainCategoryId: r.mainCategoryId,
            mainCategoryName: r.mainCategoryName,
            subCategoryId: sc.id,
            subCategoryName: getCatName(sc),
            subCategoryBuddyMode: sc.buddy_mode || false,
            items: ir.success ? ir.data : []
          }))
        )
      )
    );

    // NOTE: Items added via "Skip — No Sub-Folder" attach directly to the main
    // category id. getItemsBySubCategory needs to accept a main-category id
    // too (or you need a separate getItemsByCategory endpoint) for these to
    // show up here. Update the API client/backend if this call doesn't
    // return direct items yet.
    const directItemResults = await Promise.all(
      mainRes.data.map(mc =>
        getItemsBySubCategory(mc.id).then(ir => ({
          mainCategoryId: mc.id,
          mainCategoryName: getCatName(mc),
          subCategoryId: null,
          subCategoryName: null,
          subCategoryBuddyMode: mc.buddy_mode || false,
          items: ir.success ? ir.data : []
        })).catch(() => ({
          mainCategoryId: mc.id,
          mainCategoryName: getCatName(mc),
          subCategoryId: null,
          subCategoryName: null,
          subCategoryBuddyMode: mc.buddy_mode || false,
          items: []
        }))
      )
    );

    const itemResults = [...subItemResults, ...directItemResults];

    const flat = itemResults.flatMap(r =>
      r.items.map(item => ({
        ...item,
        mainCategoryId: r.mainCategoryId,
        mainCategoryName: r.mainCategoryName,
        subCategoryId: r.subCategoryId,
        subCategoryName: r.subCategoryName,
        subCategoryBuddyMode: r.subCategoryBuddyMode,
        word: item.translations?.en?.word || item.translations?.es?.word || item.word || '',
      }))
    );

    setAllItems(flat);
    setLoading(false);
  };

  const handleDeleteItem = (itemId, itemName) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-800">Delete <strong>"{itemName}"</strong>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">Cancel</button>
          <button onClick={async () => {
            const res = await deleteItem(itemId);
            toast.dismiss(t.id);
            res.success ? toast.success('Deleted') : toast.error(res.message);
            if (res.success) fetchAllData();
          }} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold">Delete</button>
        </div>
      </div>
    ), { duration: 6000, style: { minWidth: '280px' } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Item Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{allItems.length} items across all categories</p>
          </div>
          {view === 'list' && (
            <button onClick={() => setView('add')}
              className="flex items-center px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-sm rounded-xl transition-colors shadow-sm">
              <PlusIcon /> Add Item
            </button>
          )}
        </div>

        {view === 'add' && (
          <AddForm onDone={() => { setView('list'); fetchAllData(); }} onCancel={() => setView('list')} />
        )}
        {view === 'edit' && editingItem && (
          <EditForm
            item={editingItem}
            onDone={() => { setView('list'); setEditingItem(null); fetchAllData(); }}
            onCancel={() => { setView('list'); setEditingItem(null); }}
          />
        )}
        {view === 'list' && (
          <ItemsTable
            items={allItems}
            onEdit={item => { setEditingItem(item); setView('edit'); }}
            onDelete={handleDeleteItem}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
}