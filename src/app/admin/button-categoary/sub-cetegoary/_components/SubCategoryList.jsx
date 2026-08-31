"use client";
import React from 'react';
import { formatSubCategory, searchSubCategories } from '@/components/lib/subCategoriesApiClient';
import { Spinner } from './shared/Icons';
import { SearchIcon } from 'lucide-react';
// import { Spinner, SearchIcon } from './shared/icons';

export default function SubCategorylist({ subCategories, onEdit, onDelete, loading, searchQuery, onSearchChange }) {
  const filtered = searchSubCategories(subCategories, searchQuery);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">All Sub-Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subCategories.length} total</p>
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
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Main Category</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Icon</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Color</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Buddy</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? filtered.map(rawSc => {
                const sc = formatSubCategory(rawSc);
                return (
                  <tr key={sc.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">{sc.mainCategoryName || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{sc.formattedName}</td>
                    <td className="px-6 py-4 text-center">
                      {sc.hasImage
                        ? <img src={sc.image_icon} alt={sc.formattedName} className="h-9 w-9 mx-auto object-cover rounded-lg border border-gray-100" />
                        : <span className="text-gray-200 text-xs">—</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-7 w-7 mx-auto rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: sc.displayColor }} />
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-500">{sc.itemsText}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        sc.buddyMode ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.buddyMode ? 'bg-amber-500' : 'bg-gray-400'}`} />
                        {sc.buddyMode ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        sc.statusColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sc.statusBadge}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => onEdit(rawSc)} className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => onDelete(rawSc.id, sc.formattedName)} className="px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-gray-300 text-sm">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No sub-categories yet — hit Add Sub-Category to get started'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}