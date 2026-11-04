"use client";
import React, { useState, useEffect } from "react";
import {
  getAllQuickSpeaks,
  createQuickSpeak,
  updateQuickSpeak,
  deleteQuickSpeak,
  searchQuickSpeaks,
  formatQuickSpeak,
} from "@/components/lib/quickSpeakApiClient";

// ============================================
// SVG Icons
// ============================================

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13h-2.5z" />
    <path d="M9 13h2v5H9v-5z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const AudioIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto h-10 w-10 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
    />
  </svg>
);

// NEW: Play and Pause Icons for audio playback
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
);

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

// ============================================
// QuickSpeakForm Component (shared Add/Edit)
// ============================================

const QuickSpeakForm = ({ initialData, onSubmit, onCancel, isEdit }) => {
  const [word, setWord] = useState(initialData?.word || "");
  const [color, setColor] = useState(initialData?.color || "#FFD700");
  const [order, setOrder] = useState(initialData?.order ?? 1);
  const [isActive, setIsActive] = useState(
    initialData?.is_active !== undefined ? initialData.is_active : true,
  );
  const [imageIcon, setImageIcon] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.image_icon || "",
  );
  const [speak, setSpeak] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImageIcon(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSpeakChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Audio size must be less than 10MB");
        return;
      }
      setSpeak(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) {
      setError("Word is required");
      return;
    }
    if (!order || isNaN(order) || Number(order) < 1) {
      setError("Order must be a positive number");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        word: word.trim(),
        color,
        order: Number(order),
        isActive,
        imageIcon,
        speak,
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-xl shadow-lg max-w-2xl mx-auto bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? "Edit Quick Speak" : "Add Quick Speak"}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Word */}
        <div className="mb-6">
          <label
            htmlFor="word"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Word *
          </label>
          <input
            type="text"
            id="word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Type word or phrase"
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition placeholder-gray-500"
          />
        </div>

        {/* Color */}
        <div className="mb-6">
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 font-mono"
              placeholder="#FFD700"
            />
          </div>
        </div>

        {/* Order */}
        <div className="mb-6">
          <label
            htmlFor="order"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Order
          </label>
          <input
            type="number"
            id="order"
            value={order}
            min={1}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition placeholder-gray-500"
          />
        </div>

        {/* Is Active */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition ${
                isActive
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition ${
                !isActive
                  ? "bg-gray-200 text-gray-700 border-gray-400"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Image Icon */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image / Icon (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto h-24 w-24 object-cover rounded-md"
                />
              ) : (
                <UploadIcon />
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500"
                >
                  <span>Upload Image</span>
                  <input
                    id="image-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">JPG or PNG, max 5MB</p>
            </div>
          </div>
        </div>
        {/* Speak Audio */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speak / Audio (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {speak ? (
                <p className="text-sm text-green-600 font-medium">
                  ✓ {speak.name}
                </p>
              ) : (
                <AudioIcon />
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="speak-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500"
                >
                  <span>Upload Audio</span>
                  <input
                    id="speak-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleSpeakChange}
                    accept="audio/mpeg, audio/wav, audio/mp3"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">MP3 or WAV, max 10MB</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-start gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-400 text-gray-800 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {loading && <LoadingSpinner />}
            {loading ? (isEdit ? "Updating..." : "Creating...") : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================
// QuickSpeakList Component (UPDATED with audio playback)
// ============================================

const QuickSpeakList = ({ quickSpeaks, onEdit, onDelete, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioRefs, setAudioRefs] = useState({});
  const itemsPerPage = 10;

  // Handle audio play/pause
  const toggleAudio = (id, audioUrl) => {
    if (currentlyPlaying === id) {
      // Pause current audio
      if (audioRefs[id]) {
        audioRefs[id].pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Pause any currently playing audio
      if (currentlyPlaying && audioRefs[currentlyPlaying]) {
        audioRefs[currentlyPlaying].pause();
      }

      // Play new audio
      if (!audioRefs[id]) {
        const audio = new Audio(audioUrl);
        audio.addEventListener("ended", () => setCurrentlyPlaying(null));
        audioRefs[id] = audio;
        setAudioRefs({ ...audioRefs, [id]: audio });
      }

      audioRefs[id]
        .play()
        .catch((e) => console.error("Error playing audio:", e));
      setCurrentlyPlaying(id);
    }
  };

  const filtered = searchQuickSpeaks(quickSpeaks, searchQuery);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-8 rounded-xl shadow-lg w-full bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quick Speak List</h2>
        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
          <input
            type="text"
            placeholder="Search quick speaks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="outline-none w-64 text-sm text-gray-700 placeholder-gray-500"
          />
          <svg
            className="w-5 h-5 text-gray-500 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-600">
                Word
              </th>
              <th className="text-center p-4 font-semibold text-gray-600">
                Color
              </th>
              <th className="text-center p-4 font-semibold text-gray-600">
                Image
              </th>
              <th className="text-center p-4 font-semibold text-gray-600">
                Audio
              </th>
              <th className="text-center p-4 font-semibold text-gray-600">
                Order
              </th>
              <th className="text-center p-4 font-semibold text-gray-600">
                Status
              </th>
              <th className="text-center p-4 font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((qs) => {
                const fmt = formatQuickSpeak(qs);
                const isPlaying = currentlyPlaying === qs.id;

                return (
                  <tr
                    key={qs.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 text-left text-gray-800 font-medium">
                      {fmt.formattedWord}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <div
                          className="h-8 w-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: fmt.displayColor }}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {fmt.hasImage ? (
                        <img
                          src={qs.image_icon}
                          alt={fmt.formattedWord}
                          className="h-10 w-10 mx-auto object-cover rounded-md"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/40x40?text=Error";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {fmt.hasAudio ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleAudio(qs.id, qs.speak)}
                            className={`p-2 rounded-full transition-colors ${
                              isPlaying
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            }`}
                            title={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                          </button>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            ♪ Audio
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No audio</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-gray-700 font-medium">
                      {fmt.orderDisplay}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          qs.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {fmt.statusBadge}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 items-center justify-center">
                        <button
                          onClick={() => onEdit(qs)}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => onDelete(qs.id, fmt.formattedWord)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {searchQuery
                    ? `No quick speaks found matching "${searchQuery}"`
                    : "No quick speaks found. Add one to get started!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 mt-4">
          <div className="flex flex-1 justify-between items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-900 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md ${
                    currentPage === idx + 1
                      ? "bg-yellow-400 text-white"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-900 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Main QuickSpeak Management Component
// ============================================

export default function QuickSpeak() {
  const [quickSpeaks, setQuickSpeaks] = useState([]);
  const [currentPage, setCurrentPage] = useState("list"); // 'list' | 'add' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuickSpeaks();
  }, []);

  const fetchQuickSpeaks = async () => {
    try {
      setLoading(true);
      const response = await getAllQuickSpeaks();
      if (response.success) {
        setQuickSpeaks(response.data);
        setError("");
      } else {
        setError(response.message || "Failed to load quick speaks");
        setQuickSpeaks([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load quick speaks");
      setQuickSpeaks([]);
    } finally {
      setLoading(false);
    }
  };

  // ---- Add ----
  const handleAdd = async ({
    word,
    color,
    order,
    isActive,
    imageIcon,
    speak,
  }) => {
    const response = await createQuickSpeak(
      word,
      color,
      order,
      isActive,
      imageIcon,
      speak,
    );
    if (response.success) {
      setQuickSpeaks([response.data, ...quickSpeaks]);
      setCurrentPage("list");
    } else {
      throw new Error(response.message || "Failed to create quick speak");
    }
  };

  // ---- Update ----
  const handleUpdate = async ({
    word,
    color,
    order,
    isActive,
    imageIcon,
    speak,
  }) => {
    const response = await updateQuickSpeak(
      editingItem.id,
      word,
      color,
      order,
      isActive,
      imageIcon,
      speak,
    );
    if (response.success) {
      setQuickSpeaks(
        quickSpeaks.map((qs) =>
          qs.id === response.data.id ? response.data : qs,
        ),
      );
      setCurrentPage("list");
      setEditingItem(null);
    } else {
      throw new Error(response.message || "Failed to update quick speak");
    }
  };

  // ---- Delete ----
  const handleDelete = async (id, word) => {
    if (!window.confirm(`Are you sure you want to delete "${word}"?`)) return;
    try {
      const response = await deleteQuickSpeak(id);
      if (response.success) {
        setQuickSpeaks(quickSpeaks.filter((qs) => qs.id !== id));
      } else {
        setError(response.message || "Failed to delete quick speak");
      }
    } catch (err) {
      setError(err.message || "Failed to delete quick speak");
    }
  };

  // ---- Edit Click ----
  const handleEditClick = (item) => {
    setEditingItem(item);
    setCurrentPage("edit");
  };

  // ---- Cancel ----
  const handleCancel = () => {
    setCurrentPage("list");
    setEditingItem(null);
  };

  // ---- Render ----
  const renderContent = () => {
    switch (currentPage) {
      case "add":
        return (
          <QuickSpeakForm
            isEdit={false}
            onSubmit={handleAdd}
            onCancel={handleCancel}
          />
        );
      case "edit":
        return (
          <QuickSpeakForm
            isEdit={true}
            initialData={editingItem}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
          />
        );
      default:
        return (
          <QuickSpeakList
            quickSpeaks={quickSpeaks}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="w-full min-h-screen font-sans p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="mx-auto">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quick Speak Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create, edit, and manage quick speak buttons
            </p>
          </div>
          {currentPage === "list" && (
            <button
              onClick={() => setCurrentPage("add")}
              className="flex items-center justify-center bg-yellow-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-500 transition-all duration-300"
            >
              <PlusIcon />
              Add Quick Speak
            </button>
          )}
        </header>

        {/* Global Error */}
        {error && currentPage === "list" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={fetchQuickSpeaks}
              className="ml-4 text-red-700 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <main className="w-full">{renderContent()}</main>
      </div>
    </div>
  );
}
