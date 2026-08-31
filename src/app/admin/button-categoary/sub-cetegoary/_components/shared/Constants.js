// Language options shown in the Add/Edit category forms
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
];

// File upload limits
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;  // 5MB
export const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Default color used when creating a new category
export const DEFAULT_CATEGORY_COLOR = '#FF5733';

// CategoryList pagination / page size (kept large since the API returns
// the full nested tree in one response, not paginated)
export const ITEMS_PER_PAGE = 5000;

// Color swatches offered in the sub-category / item color pickers
export const COLORS = [
  { name: 'Orange',    value: '#FF5733' },
  { name: 'Peach',     value: '#F5A662' },
  { name: 'Green',     value: '#87D977' },
  { name: 'Blue',      value: '#75B6EB' },
  { name: 'Yellow',    value: '#FDD268' },
  { name: 'Gray',      value: '#D9D9D9' },
  { name: 'Off-white', value: '#E8E6E0' },
];
