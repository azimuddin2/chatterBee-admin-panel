"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  updateItem,
  formatItem,
} from "@/components/lib/categoryItemsApiClient";
import {
  getAllRootCategories,
  getTranslatedName,
} from "@/components/lib/categoryApiClient";
import {
  formatSubCategory,
  getAllSubCategories,
} from "@/components/lib/subCategoriesApiClient";
import { COLORS } from "../../sub-cetegoary/_components/shared/Constants"; // same list the ColorPicker in ui.jsx uses
import { Spinner } from "../../sub-cetegoary/_components/shared/Icons";
import {
  SmartDropdown,
  ColorPicker,
  BuddyModeToggle,
  LangPills,
  ImageUploadField,
} from "../../sub-cetegoary/_components/shared/ui";

const CATEGORY_PAGE_SIZE = 5000;

// Module-level cache: form abar khulle notun kore fetch korbe na
const cache = { categories: null, subCategories: null };

// Sub-category ta kon main category-r under e, tar id (field name alada hole-o kaj korbe)
const getSubCatParentId = (sc) =>
  sc?.main_category_id ??
  sc?.mainCategoryId ??
  sc?.category_id ??
  sc?.main_category?.id ??
  null;

// Sub-category ta ei category-r kina (id thakle id diye, na thakle name diye)
const matchCat = (sc, cat) =>
  getSubCatParentId(sc) != null
    ? String(getSubCatParentId(sc)) === String(cat.id)
    : sc.main_category_name === (cat.rawName ?? cat.name);

const getAllPages = async (fetchPage) => {
  // 1st page age, tarpor baki page gulo ekshathe (parallel)
  const first = await fetchPage(1);
  if (!first.success)
    throw new Error(first.message || "Could not load categories");

  const totalPages = Math.max(
    first.pagination?.totalPages || 1,
    Math.ceil((first.pagination?.totalCount || 0) / CATEGORY_PAGE_SIZE),
  );

  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2)),
  );

  const data = [...first.data];
  for (const result of rest) {
    if (!result.success)
      throw new Error(result.message || "Could not load categories");
    data.push(...result.data);
  }
  return data;
};

const makeCatOption = (sc) => {
  const key = getSubCatParentId(sc) ?? sc?.main_category_name ?? null;
  if (key === null) return null;
  const name = sc.main_category_name || "Unknown";
  return { id: key, name, displayLabel: name };
};

function ClearButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-0 right-0 text-xs font-semibold text-amber-600 hover:text-amber-500"
    >
      Clear
    </button>
  );
}

export default function EditItem({ item, onDone, onCancel }) {
  const existingLang = Object.keys(item.translations || {})[0] || "en";
  const formatted = formatItem(item, existingLang);
  // Normalize so "#FFAA00", "ffaa00", " #ffaa00 " all match.
  const normColor = (v) => {
    const s = String(v ?? "")
      .trim()
      .toLowerCase();
    return s && !s.startsWith("#") && /^[0-9a-f]{3,8}$/.test(s) ? `#${s}` : s;
  };
  // The list page shows the swatch from formatItem().displayColor, so use the
  // exact same source here. Fall back to raw fields only if it is missing.
  const rawColor =
    formatted.displayColor ??
    item.color ??
    item.colour ??
    item.color_code ??
    item.bg_color;
  const existingColor =
    COLORS.find((c) => normColor(c.value) === normColor(rawColor)) ||
    COLORS.find(
      (c) =>
        c.name && c.name.toLowerCase() === String(rawColor ?? "").toLowerCase(),
    ) ||
    (rawColor ? { name: "Current", value: rawColor } : COLORS[0]);

  // Category + Sub-category
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [subCatLoading, setSubCatLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  // Item fields
  const [word, setWord] = useState(formatted.formattedWord);
  const [speakAs, setSpeakAs] = useState(
    item.translations?.[existingLang]?.speak_as || "",
  );
  const [lang, setLang] = useState(existingLang);
  const [color, setColor] = useState(existingColor);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image_icon || "");
  const [audioFile, setAudioFile] = useState(null);
  const [buddyMode, setBuddyMode] = useState(item.buddy_mode || false);
  const [submitting, setSubmitting] = useState(false);

  // If the selected sub-category has Buddy Mode ON, lock it ON here too.
  const parentBuddyMode = selectedSub?.buddy_mode ?? false;
  const parentBuddyLocked = selectedSub !== null && parentBuddyMode === true;
  const effectiveBuddyMode = parentBuddyLocked ? true : buddyMode;

  const imagePreviewUrlRef = useRef("");
  useEffect(
    () => () => {
      if (imagePreviewUrlRef.current)
        URL.revokeObjectURL(imagePreviewUrlRef.current);
    },
    [],
  );

  // ── Load categories (alada, jate sub-category-r jonno wait korte na hoy) ──
  useEffect(() => {
    let cancelled = false;

    if (cache.categories) {
      setCategories(cache.categories);
      return;
    }

    setCatLoading(true);
    getAllPages((page) =>
      getAllRootCategories({
        lang: "en",
        page,
        page_size: CATEGORY_PAGE_SIZE,
      }),
    )
      .then((data) => {
        cache.categories = data;
        if (!cancelled) setCategories(data);
      })
      .catch((error) => {
        if (!cancelled)
          toast.error(error.message || "Could not load categories");
      })
      .finally(() => {
        if (!cancelled) setCatLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load sub-categories, then pre-select the item's current one ──
  useEffect(() => {
    let cancelled = false;

    const preselect = (subCategoryData) => {
      // Backend item e alada field ache: main_category / sub_category.
      // Purono shape (shudhu `category`) hole seta sub-category id dhorbo.
      const hasNewShape = "main_category" in item || "sub_category" in item;
      const subId = hasNewShape
        ? item.sub_category
        : typeof item.category === "object"
          ? item.category?.id
          : item.category;
      const subName = hasNewShape ? item.sub_category_name : item.category_name;
      const mainId = hasNewShape ? item.main_category : null;

      // 1) Sub-category: id diye khuji
      let current =
        subId != null && subId !== ""
          ? subCategoryData.find((sc) => String(sc.id) === String(subId))
          : undefined;

      // 2) fallback: name diye
      if (!current && subName) {
        const target = String(subName).trim().toLowerCase();
        current = subCategoryData.find(
          (sc) =>
            String(sc.name ?? "")
              .trim()
              .toLowerCase() === target ||
            formatSubCategory(sc, existingLang)
              .formattedName?.trim()
              .toLowerCase() === target,
        );
      }

      // Sub-category list e na thakle fallback
      if (!current && subId != null && subId !== "") {
        current = {
          id: subId,
          name: subName,
          displayLabel: subName || `Sub-category #${subId}`,
          _fallback: true,
        };
      }

      if (current && !current.displayLabel) {
        current = {
          ...current,
          displayLabel: formatSubCategory(current, existingLang).formattedName,
        };
      }

      if (current) setSelectedSub(current);

      // Main category: item er nijer main_category theke (sub-category na thakleo)
      if (mainId != null && mainId !== "") {
        const mainName = item.main_category_name || "Unknown";
        setSelectedCat({
          id: mainId,
          name: mainName,
          rawName: mainName,
          displayLabel: mainName,
        });
      } else if (current) {
        const catOpt = makeCatOption(current);
        if (catOpt) setSelectedCat(catOpt);
      }
    };

    if (cache.subCategories) {
      setSubCategories(cache.subCategories);
      preselect(cache.subCategories);
      return;
    }

    setSubCatLoading(true);
    getAllPages((page) =>
      getAllSubCategories({ page, page_size: CATEGORY_PAGE_SIZE }),
    )
      .then((data) => {
        cache.subCategories = data;
        if (cancelled) return;
        setSubCategories(data);
        preselect(data);
      })
      .catch((error) => {
        if (!cancelled)
          toast.error(error.message || "Could not load sub-categories");
      })
      .finally(() => {
        if (!cancelled) setSubCatLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    item.category,
    item.category_name,
    item.main_category,
    item.sub_category,
    existingLang,
  ]);

  // ── Category options ──
  const categoryOptions = useMemo(() => {
    return categories.map((category) => {
      const name =
        getTranslatedName(category.translations, lang) ||
        category.name ||
        category.main_category_name ||
        "Unknown";
      // rawName = translate na kora original name (name diye match korar jonno)
      return {
        ...category,
        name,
        rawName: category.name || category.main_category_name,
        displayLabel: name,
      };
    });
  }, [categories, lang]);

  // ── Sub-category options (category select thakle sudhu oi category-r gulo) ──
  const subCatOptions = useMemo(() => {
    const list = selectedCat
      ? subCategories.filter((sc) => matchCat(sc, selectedCat))
      : subCategories;

    const options = list.map((sc) => {
      const f = formatSubCategory(sc, lang);
      const displayLabel = selectedCat
        ? f.formattedName
        : `${sc.main_category_name || "Unknown"} → ${f.formattedName}`;
      return { ...sc, displayLabel };
    });

    // Keep the fallback option in the list so it can be shown/selected.
    return selectedSub?._fallback ? [selectedSub, ...options] : options;
  }, [subCategories, selectedCat, selectedSub, lang]);

  // ── Handlers ──
  const handleCategorySelect = (cat) => {
    setSelectedCat(cat);
    // Notun category-r sathe na mille age-r sub-category clear
    if (selectedSub && !matchCat(selectedSub, cat)) setSelectedSub(null);
  };

  const handleCategoryClear = () => {
    setSelectedCat(null);
    setSelectedSub(null);
  };

  const handleSubSelect = (sc) => {
    setSelectedSub(sc);
    // Category select kora na thakle sub-category theke auto-set
    if (!selectedCat) {
      const catOpt = makeCatOption(sc);
      if (catOpt) setSelectedCat(catOpt);
    }
  };

  const handleSubClear = () => {
    setSelectedSub(null);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    if (imagePreviewUrlRef.current)
      URL.revokeObjectURL(imagePreviewUrlRef.current);
    const url = URL.createObjectURL(f);
    imagePreviewUrlRef.current = url;
    setImageFile(f);
    setImagePreview(url);
  };

  const handleAudioChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Audio must be under 10MB");
      return;
    }
    setAudioFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) {
      toast.error("Item word is required");
      return;
    }
    setSubmitting(true);
    toast.loading("Updating item...", { id: "update-item" });
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
      selectedSub?.id ?? null, // sub-category na thakle null
      selectedCat?.id ?? null, // main category (sub-category chhara-o jabe)
    );
    if (!res.success) {
      toast.error(res.message, { id: "update-item" });
      setSubmitting(false);
      return;
    }

    toast.success("Item updated! ✓", { id: "update-item" });
    setSubmitting(false);
    onDone();
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Edit Item</h2>
      <p className="text-sm text-gray-400 mb-6">
        Update this item. Category and sub-category are optional.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category → Sub-category */}
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Choose a category to narrow down the sub-categories, or search
            sub-categories directly.
          </p>

          <div className="relative">
            {selectedCat && <ClearButton onClick={handleCategoryClear} />}
            <SmartDropdown
              label="Category (optional)"
              value={selectedCat}
              options={categoryOptions}
              onSelect={handleCategorySelect}
              placeholder="Select a category..."
              loading={catLoading}
              renderName={(c) => c.displayLabel}
            />
          </div>

          <div className="relative">
            {selectedSub && <ClearButton onClick={handleSubClear} />}
            <SmartDropdown
              label="Sub-Category (optional)"
              value={selectedSub}
              options={subCatOptions}
              onSelect={handleSubSelect}
              placeholder={
                selectedCat
                  ? `Select a sub-category in ${selectedCat.displayLabel}...`
                  : "Select a sub-category..."
              }
              loading={subCatLoading}
              renderName={(sc) => sc.displayLabel}
            />
            {selectedCat && !subCatLoading && subCatOptions.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">
                No sub-categories in this category. You can leave this empty.
              </p>
            )}
          </div>

          {/* Item kothay save hobe, seta dekhay */}
          {selectedSub ? (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <span>✓</span>
              <span>
                Will be saved in{" "}
                <strong>
                  {selectedSub.main_category_name
                    ? `${selectedSub.main_category_name} → `
                    : ""}
                  {selectedSub._fallback
                    ? selectedSub.displayLabel
                    : formatSubCategory(selectedSub, lang).formattedName}
                </strong>
              </span>
            </div>
          ) : selectedCat ? (
            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              This item will be saved under the category only. You can also pick
              a sub-category below.
            </div>
          ) : null}
        </div>

        {parentBuddyMode && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 -mt-2">
            <span>🔒</span>
            <span>
              This sub-category has Buddy Mode ON — this item will inherit it.
            </span>
          </div>
        )}

        <LangPills value={lang} onChange={setLang} />

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Word *
          </p>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="e.g. Apple, Happy, Run..."
            className={inputClass}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Speak As{" "}
            <span className="text-gray-400 font-normal normal-case">
              (optional — overrides TTS pronunciation)
            </span>
          </p>
          <input
            type="text"
            value={speakAs}
            onChange={(e) => setSpeakAs(e.target.value)}
            placeholder="e.g. 'Ap-uhl' for unusual pronunciations"
            className={inputClass}
          />
        </div>

        <ColorPicker selected={color} onSelect={setColor} />

        <BuddyModeToggle
          value={effectiveBuddyMode}
          onChange={setBuddyMode}
          locked={parentBuddyLocked}
          lockedReason={
            parentBuddyMode
              ? "Parent sub-category has Buddy Mode ON"
              : undefined
          }
        />

        <ImageUploadField
          imagePreview={imagePreview}
          onChange={handleImageChange}
          label="Icon"
        />

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Custom Audio{" "}
            <span className="text-gray-400 font-normal normal-case">
              (optional — device TTS used if not provided)
            </span>
          </p>
          <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl">
            {audioFile ? (
              <p className="text-sm text-green-600 font-medium">
                ✓ {audioFile.name}
              </p>
            ) : formatted.hasAudio ? (
              <p className="text-sm text-gray-500">
                Existing custom audio on file
              </p>
            ) : (
              <p className="text-sm text-gray-400">No file selected</p>
            )}
            <label className="cursor-pointer text-sm font-semibold text-amber-600 hover:text-amber-500 ml-auto">
              <span>Upload audio</span>
              <input
                type="file"
                className="sr-only"
                onChange={handleAudioChange}
                accept="audio/mpeg, audio/wav, audio/mp3"
              />
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 rounded-xl text-sm font-bold text-gray-900 transition-colors"
          >
            {submitting ? (
              <>
                <Spinner sm /> Updating...
              </>
            ) : (
              "✓ Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}