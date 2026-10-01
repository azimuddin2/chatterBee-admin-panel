'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    PlusIcon, TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon,
    CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { createFaq, deleteFaq, getAllFaqs, updateFaq } from '../lib/settingsApiClient';


const Spinner = () => (
    <div className="flex justify-center items-center py-24">
        <div className="h-9 w-9 rounded-full border-4 border-[#FDD268] border-t-transparent animate-spin" />
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

/** Delete confirmation modal */
const ConfirmDeleteModal = ({ title, busy, onCancel, onConfirm }) => {
    const cancelRef = useRef(null);

    // Esc chaple bondho, ar Cancel button e focus
    useEffect(() => {
        cancelRef.current?.focus();
        const onKey = (e) => {
            if (e.key === 'Escape' && !busy) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [busy, onCancel]);

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onMouseDown={(e) => {
                // Backdrop e click korle bondho (modal er bhetore click hole na)
                if (e.target === e.currentTarget && !busy) onCancel();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-faq-title"
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 id="delete-faq-title" className="text-lg font-semibold text-gray-900">
                            Delete this FAQ?
                        </h3>
                        {title ? (
                            <p className="mt-1 text-sm font-medium text-gray-800 break-words line-clamp-2">
                                “{title}”
                            </p>
                        ) : null}
                        <p className="mt-2 text-sm text-gray-500">
                            This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-300
                       text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
                       bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
                    >
                        {busy ? (
                            <>
                                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <TrashIcon className="h-4 w-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

/** Single FAQ row with inline edit. */
const FaqRow = ({ faq, onSave, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(faq.title ?? '');
    const [content, setContent] = useState(faq.content ?? '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(faq.id, { title, content });
        setSaving(false);
        setEditing(false);
    };

    const handleCancel = () => {
        setTitle(faq.title ?? '');
        setContent(faq.content ?? '');
        setEditing(false);
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 bg-white shadow-sm transition-shadow hover:shadow-md">

            {/* ── Row header ── */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                {editing ? (
                    <input
                        className="flex-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300
                       rounded-lg px-3 py-1.5 mr-3 focus:outline-none focus:ring-2 focus:ring-[#FDD268]"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Question / Title"
                    />
                ) : (
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {faq.title || <span className="text-gray-400 italic">No title</span>}
                    </p>
                )}

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1 text-xs bg-[#FDD268] hover:bg-yellow-300 text-black
                           font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <CheckIcon className="h-3.5 w-3.5" />
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700
                           font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="h-3.5 w-3.5" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium
                           px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <PencilSquareIcon className="h-3.5 w-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(faq.id)}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium
                           px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <TrashIcon className="h-3.5 w-3.5" />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Row content ── */}
            {editing ? (
                <textarea
                    className="w-full text-sm text-gray-700 px-4 py-3 min-h-[100px] resize-y
                     focus:outline-none focus:ring-2 focus:ring-[#FDD268]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Answer / Content"
                />
            ) : (
                <div
                    className="px-4 py-3 text-sm text-gray-600 leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{
                        __html: faq.content || '<span class="text-gray-400 italic">No content</span>',
                    }}
                />
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FAQ COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const FaqSection = () => {
    const toastTimer = useRef(null);

    // ── state ────────────────────────────────────────────────────────────────
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null); // { message, type }

    // new-FAQ form
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [addingFaq, setAddingFaq] = useState(false);

    // delete confirmation modal
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
    const [deleting, setDeleting] = useState(false);

    // ── toast helper ─────────────────────────────────────────────────────────
    const showToast = useCallback((message, type = 'success') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 3500);
    }, []);

    useEffect(() => () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
    }, []);

    // ── load FAQs on mount ───────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const data = await getAllFaqs();
                if (!cancelled) setFaqs(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!cancelled) showToast(err.message || 'Failed to load FAQs.', 'error');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [showToast]);

    // ── handlers ─────────────────────────────────────────────────────────────
    const handleCreateFaq = async () => {
        if (!newTitle.trim() && !newContent.trim()) return;
        setAddingFaq(true);
        try {
            const created = await createFaq({ title: newTitle, content: newContent });
            setFaqs((prev) => [...prev, created]);
            setNewTitle('');
            setNewContent('');
            showToast('FAQ created!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to create FAQ.', 'error');
        } finally {
            setAddingFaq(false);
        }
    };

    const handleUpdateFaq = async (id, payload) => {
        try {
            const updated = await updateFaq(id, payload);
            setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
            showToast('FAQ updated!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to update FAQ.', 'error');
        }
    };

    // Delete button click -> modal kholo
    const askDeleteFaq = (id) => {
        const faq = faqs.find((f) => f.id === id);
        setDeleteTarget({ id, title: faq?.title ?? '' });
    };

    const closeDeleteModal = useCallback(() => {
        setDeleteTarget(null);
    }, []);

    // Modal e "Delete" click -> ashole delete
    const confirmDeleteFaq = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteFaq(deleteTarget.id);
            setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id));
            showToast('FAQ deleted.', 'success');
            setDeleteTarget(null);
        } catch (err) {
            showToast(err.message || 'Failed to delete FAQ.', 'error');
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div>
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {loading ? <Spinner /> : (
                <>
                    <p className="text-sm text-gray-500 mb-4">
                        {faqs.length} item{faqs.length !== 1 ? 's' : ''}
                    </p>

                    {faqs.length === 0 ? (
                        <p className="text-center text-gray-400 italic py-10">
                            No FAQs yet — add one below!
                        </p>
                    ) : (
                        faqs.map((faq) => (
                            <FaqRow
                                key={faq.id}
                                faq={faq}
                                onSave={handleUpdateFaq}
                                onDelete={askDeleteFaq}
                            />
                        ))
                    )}

                    {/* ── Add new FAQ form ── */}
                    <div className="mt-6 border-2 border-dashed border-gray-300 rounded-xl p-5 bg-white">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <PlusIcon className="h-4 w-4 text-[#FDD268]" />
                            Add New FAQ
                        </p>

                        <input
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-2
                         focus:outline-none focus:ring-2 focus:ring-[#FDD268]"
                            placeholder="Question / Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-4
                         min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-[#FDD268]"
                            placeholder="Answer / Content"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />

                        <button
                            onClick={handleCreateFaq}
                            disabled={addingFaq || (!newTitle.trim() && !newContent.trim())}
                            className="w-full flex justify-center items-center gap-2 rounded-lg bg-[#FDD268]
                         hover:bg-yellow-300 text-black py-2.5 text-sm font-semibold
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {addingFaq ? (
                                <>
                                    <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="h-4 w-4" />
                                    Create FAQ
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}

            {/* ── Delete confirmation modal ── */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    title={deleteTarget.title}
                    busy={deleting}
                    onCancel={closeDeleteModal}
                    onConfirm={confirmDeleteFaq}
                />
            )}
        </div>
    );
};

export default FaqSection;