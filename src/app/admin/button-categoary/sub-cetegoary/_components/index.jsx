"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { getSubCategoriesByParent, deleteSubCategory } from '@/components/lib/subCategoriesApiClient';

import AddSubCategoary from './AddSubCategory';
import EditSubCategoary from './EditSubCategory';
import SubCategorylist from './SubCategoryList';
import { fetchRootCategories, getCatName } from './shared/Helpers';
import { PlusIcon } from './shared/Icons';
import LoadingPage from '@/app/admin/loading';

export default function SubCategoryManagement() {
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);

    // 1. Get every main (root) category first.
    const mainRes = await fetchRootCategories();
    if (!mainRes.success || mainRes.data.length === 0) {
      if (!mainRes.success) toast.error(mainRes.message || 'Failed to load main categories');
      setAllSubCategories([]);
      setLoading(false);
      return;
    }

    // 2. For each main category, fetch its sub-categories in parallel.
    //    getSubCategoriesByParent returns { success, data: [...] } — a flat
    //    array for that one parent, per subCategoriesApiClient.js.
    const subResults = await Promise.all(
      mainRes.data.map(mc =>
        getSubCategoriesByParent(mc.id).then(r => ({
          mainCategoryId: mc.id,
          mainCategoryName: getCatName(mc),
          mainCategoryBuddyMode: mc.buddy_mode || false,
          subs: r.success ? r.data : [],
        })).catch(() => ({
          mainCategoryId: mc.id,
          mainCategoryName: getCatName(mc),
          mainCategoryBuddyMode: mc.buddy_mode || false,
          subs: [],
        }))
      )
    );

    // 3. Flatten into one list, tagging each sub-category with its parent info.
    const flat = subResults.flatMap(r =>
      r.subs.map(sc => ({
        ...sc,
        mainCategoryId: r.mainCategoryId,
        mainCategoryName: r.mainCategoryName,
        mainCategoryBuddyMode: r.mainCategoryBuddyMode,
      }))
    );

    setAllSubCategories(flat);
    setLoading(false);
  };

  const handleDeleteSubCategory = (subCategoryId, subCategoryName) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-800">Delete <strong>"{subCategoryName}"</strong>?</p>
        <p className="text-xs text-gray-400">Items inside it may need to be moved first.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">Cancel</button>
          <button onClick={async () => {
            const res = await deleteSubCategory(subCategoryId);
            toast.dismiss(t.id);
            res.success ? toast.success('Deleted') : toast.error(res.message);
            if (res.success) fetchAllData();
          }} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold">Delete</button>
        </div>
      </div>
    ), { duration: 6000, style: { minWidth: '280px' } });
  };

  
    if(loading){
      return <LoadingPage/>
    }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sub-Category Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{allSubCategories.length} sub-categories across all categories</p>
          </div>
          {view === 'list' && (
            <button onClick={() => setView('add')}
              className="flex items-center px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-sm rounded-xl transition-colors shadow-sm">
              <PlusIcon /> Add Sub-Category
            </button>
          )}
        </div>

        {view === 'add' && (
          <AddSubCategoary onDone={() => { setView('list'); fetchAllData(); }} onCancel={() => setView('list')} />
        )}
        {view === 'edit' && editingSubCategory && (
          <EditSubCategoary
            subCategory={editingSubCategory}
            onDone={() => { setView('list'); setEditingSubCategory(null); fetchAllData(); }}
            onCancel={() => { setView('list'); setEditingSubCategory(null); }}
          />
        )}
        {view === 'list' && (
          <SubCategorylist
            subCategories={allSubCategories}
            onEdit={sc => { setEditingSubCategory(sc); setView('edit'); }}
            onDelete={handleDeleteSubCategory}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
}