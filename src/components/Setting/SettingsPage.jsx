'use client';

import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';
import {
  ArrowLeftIcon,
  PencilSquareIcon, CheckIcon, XMarkIcon,
  ShieldCheckIcon, DocumentTextIcon, InformationCircleIcon,
  QuestionMarkCircleIcon, EyeIcon, ArrowUturnLeftIcon,
  CheckCircleIcon, ExclamationCircleIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { fetchSettingByTab, saveSettingByTab } from '../lib/settingsApiClient';
import FaqSection from './Faqsection';

// ── Jodit (SSR-safe) ──────────────────────────────────────────────────────────
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'privacy-security', label: 'Privacy Policy', Icon: ShieldCheckIcon,
    desc: 'Explain how user data is collected, used and protected.',
  },
  {
    id: 'terms-conditions', label: 'Terms & Conditions', Icon: DocumentTextIcon,
    desc: 'Rules and conditions users agree to when using the app.',
  },
  {
    id: 'about-us', label: 'About Us', Icon: InformationCircleIcon,
    desc: 'Tell users who you are and what the app is about.',
  },
  {
    id: 'faq', label: 'FAQ', Icon: QuestionMarkCircleIcon,
    desc: 'Common questions and answers shown to users.',
  },
];

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

const PREVIEW_CSS = `
.legal-preview { color:#374151; line-height:1.7; font-size:15px; word-break:break-word; }
.legal-preview h1 { font-size:1.6rem; font-weight:700; margin:1.2rem 0 .6rem; color:#111827; }
.legal-preview h2 { font-size:1.35rem; font-weight:700; margin:1.1rem 0 .5rem; color:#111827; }
.legal-preview h3 { font-size:1.15rem; font-weight:600; margin:1rem 0 .4rem; color:#111827; }
.legal-preview p  { margin:.7rem 0; }
.legal-preview ul { list-style:disc; padding-left:1.6rem; margin:.7rem 0; }
.legal-preview ol { list-style:decimal; padding-left:1.6rem; margin:.7rem 0; }
.legal-preview a  { color:#2563eb; text-decoration:underline; }
.legal-preview hr { margin:1.2rem 0; border-color:#e5e7eb; }
.legal-preview table { border-collapse:collapse; width:100%; margin:1rem 0; }
.legal-preview td, .legal-preview th { border:1px solid #d1d5db; padding:6px 10px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const EditorSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-10 bg-gray-200 rounded-lg" />
    <div className="h-4 bg-gray-200 rounded w-11/12" />
    <div className="h-4 bg-gray-200 rounded w-10/12" />
    <div className="h-4 bg-gray-200 rounded w-9/12" />
    <div className="h-4 bg-gray-200 rounded w-11/12" />
    <div className="h-4 bg-gray-200 rounded w-7/12" />
  </div>
);

/** Inline message banner */
const Toast = ({ message, type, onClose }) => (
  <div
    role="status"
    className={`flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-lg text-sm font-medium border
      ${type === 'success'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-red-50 text-red-700 border-red-200'}`}
  >
    <span className="flex items-center gap-2">
      {type === 'success'
        ? <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
        : <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />}
      {message}
    </span>
    <button
      onClick={onClose}
      aria-label="Dismiss"
      className="opacity-70 hover:opacity-100 transition-opacity"
    >
      <XMarkIcon className="h-4 w-4" />
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SettingsPage = ({ onBackClick }) => {
  const contentRef = useRef('');   
  const savedRef = useRef('');    
  const touchedRef = useRef(false);
  const toastTimer = useRef(null);
  const saveRef = useRef(null);  

  // ── state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('privacy-security');
  const [editableContent, setEditableContent] = useState('');

  // editor UX
  const [mode, setMode] = useState('edit');         
  const [isDirty, setIsDirty] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // UI flags
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); 

  const currentTab = TABS.find((t) => t.id === activeTab);

  // ── toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  // ── load content on tab change ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setMode('edit');
      setIsDirty(false);
      touchedRef.current = false;
      if (activeTab === 'faq') return; 
      setLoading(true);
      contentRef.current = '';
      setEditableContent('');
      try {
        const data = await fetchSettingByTab(activeTab);
        if (!cancelled) {
          contentRef.current = data?.content ?? '';
          savedRef.current = contentRef.current;
          setEditableContent(contentRef.current);
          setLastUpdated(data?.updated_at ?? null);
        }
      } catch (err) {
        if (!cancelled) showToast(err.message || 'Failed to load content.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [activeTab, showToast]);

  // ── Jodit config (memoised so editor doesn't re-mount) ───────────────────
  const joditConfig = useMemo(() => ({
    readonly: false,
    spellcheck: false,
    theme: 'light',
    toolbarButtonSize: 'middle',
    minHeight: 380,
    placeholder: 'Start writing here…',
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: true,
    askBeforePasteHTML: false,
    defaultActionOnPaste: 'insert_clear_html',
    buttons: [
      'undo', 'redo', '|',
      'paragraph', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'align', '|',
      'link', 'table', 'hr', '|',
      'eraser', 'fullsize', '|',
      'source',
    ],
  }), []);

  // ── editor handlers ──────────────────────────────────────────────────────
  const handleEditorChange = (val) => {
    contentRef.current = val;
    if (!touchedRef.current) {
      savedRef.current = val;
      return;
    }
    const dirty = val !== savedRef.current;
    setIsDirty((prev) => (prev === dirty ? prev : dirty));
  };

  const handleEditorBlur = (val) => {
    contentRef.current = val;
    setEditableContent(val);
  };

  const markTouched = () => { touchedRef.current = true; };

  // ── tab change (unsaved changes guard) ───────────────────────────────────
  const handleTabChange = (id) => {
    if (id === activeTab) return;
    if (isDirty && activeTab !== 'faq') {
      const ok = window.confirm('You have unsaved changes. Discard them and switch tab?');
      if (!ok) return;
    }
    setActiveTab(id);
  };

  // ── edit / preview toggle ────────────────────────────────────────────────
  const switchMode = (next) => {
    if (next === mode) return;
    setEditableContent(contentRef.current);
    setMode(next);
  };

  // ── discard changes ──────────────────────────────────────────────────────
  const handleDiscard = () => {
    if (!window.confirm('Discard all unsaved changes?')) return;
    contentRef.current = savedRef.current;
    setEditableContent(savedRef.current);
    touchedRef.current = false;
    setIsDirty(false);
    setEditorKey((k) => k + 1);
  };

  // ── save rich-text setting ───────────────────────────────────────────────
  const handleSaveSetting = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const html = contentRef.current;
      await saveSettingByTab(activeTab, html);
      const fresh = await fetchSettingByTab(activeTab);
      contentRef.current = fresh?.content ?? html;
      savedRef.current = contentRef.current;
      touchedRef.current = false;
      setEditableContent(contentRef.current);
      setLastUpdated(fresh?.updated_at ?? new Date().toISOString());
      setIsDirty(false);

      showToast('Saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };
  saveRef.current = handleSaveSetting;

  // ── Ctrl/Cmd + S to save ─────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'faq') return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  const updatedLabel = formatDate(lastUpdated);

  return (
    <div className="bg-white rounded-2xl min-h-screen text-black p-6 sm:p-8 font-inter">
      <style>{PREVIEW_CSS}</style>

      {/* ── Page header ── */}
      <div className="flex items-center mb-6">
        {onBackClick && (
          <button
            onClick={onBackClick}
            aria-label="Go back"
            className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage the legal pages and help content shown in your app.
          </p>
        </div>
      </div>

      {/* ── Tabs (pill style) ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                border transition-all
                ${active
                  ? 'bg-[#FDD268] border-[#FDD268] text-black shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black'}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab panel ── */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl min-h-[400px]">

        {/* ── Section heading ── */}
        <div className="flex items-start gap-3 mb-5">
          <div className="h-11 w-11 rounded-xl bg-[#FDD268]/30 flex items-center justify-center flex-shrink-0">
            {currentTab && <currentTab.Icon className="h-6 w-6 text-gray-800" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{currentTab?.label}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{currentTab?.desc}</p>
          </div>
        </div>

        {activeTab === 'faq' ? (

          /* ════════ FAQ TAB (alada component) ════════ */
          <FaqSection />

        ) : (

          /* ════════ RICH-TEXT TABS (Privacy / Terms / About) ════════ */
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            {/* ── Card top bar: Edit/Preview + last updated ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="inline-flex rounded-lg bg-gray-200/70 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${mode === 'edit' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:text-black'}`}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${mode === 'preview' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:text-black'}`}
                >
                  <EyeIcon className="h-4 w-4" />
                  Preview
                </button>
              </div>

              {updatedLabel && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  Last updated: {updatedLabel}
                </span>
              )}
            </div>

            {/* ── Card body ── */}
            {loading ? (
              <EditorSkeleton />
            ) : mode === 'edit' ? (
              <div
                onKeyDownCapture={markTouched}
                onPointerDownCapture={markTouched}
              >
                <JoditEditor
                  key={`${activeTab}-${editorKey}`}
                  value={editableContent}
                  config={joditConfig}
                  onChange={handleEditorChange}
                  onBlur={handleEditorBlur}
                />
              </div>
            ) : (
              <div className="p-5 sm:p-6 min-h-[380px]">
                <div
                  className="legal-preview"
                  dangerouslySetInnerHTML={{
                    __html:
                      contentRef.current ||
                      '<p style="color:#9ca3af;font-style:italic">Nothing to preview yet. Switch to Edit and write something.</p>',
                  }}
                />
              </div>
            )}

            {/* ── Card footer: status + actions ── */}
            <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
              {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* status */}
                <div className="text-sm">
                  {isDirty ? (
                    <span className="flex items-center gap-2 text-amber-700">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      You have unsaved changes
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-500">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      All changes saved
                    </span>
                  )}
                  <span className="hidden sm:inline text-xs text-gray-400 ml-3">
                    Tip: press Ctrl + S to save
                  </span>
                </div>

                {/* actions */}
                <div className="flex items-center gap-2">
                  {isDirty && (
                    <button
                      type="button"
                      onClick={handleDiscard}
                      disabled={saving}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium
                                 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100
                                 transition-colors disabled:opacity-50"
                    >
                      <ArrowUturnLeftIcon className="h-4 w-4" />
                      Discard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveSetting}
                    disabled={saving || loading}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 rounded-lg bg-[#FDD268]
                               hover:bg-yellow-300 text-black px-6 py-2.5 font-semibold text-sm
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Save & Change
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;