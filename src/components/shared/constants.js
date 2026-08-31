// ─── LANGUAGE OPTIONS ─────────────────────────────────────────
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
];

// ─── COLORS ──────────────────────────────────────────────────
// Original 6 presets, PLUS the Mulberry-style AAC symbol color-coding set
// (Yellow=Pronouns, Orange=Nouns, Green=Verbs, etc.) so users can match a
// Mulberry reference sheet directly from the dropdown.
// A "Custom Color" picker (hex input) is also available below the presets
// in <ColorPicker />, so the list below is never a hard limit.
export const COLORS = [
  { name: 'Gold',        value: '#FDD268' },
  { name: 'Cream',       value: '#FFF8E6' },
  { name: 'Light Pink',  value: '#FFE2DE' },
  { name: 'Powder Blue', value: '#DDF2F5' },
  { name: 'Lavender',    value: '#E8E8F6' },
  { name: 'Mint Green',  value: '#E7F5E3' },
  { name: 'Yellow — Pronouns',        value: '#FDDEA8' },
  { name: 'Orange — Nouns',           value: '#FBBF8A' },
  { name: 'Green — Verbs',            value: '#A8D8A8' },
  { name: 'Blue — Descriptive',       value: '#A8C8E8' },
  { name: 'Purple — Questions',       value: '#C9B8E8' },
  { name: 'Pink — Feelings',          value: '#F5B8C8' },
  { name: 'Red — Negation',           value: '#F4A8A8' },
  { name: 'Beige — Prepositions',     value: '#F8E0B8' },
  { name: 'Gray — Alphabet/Number',   value: '#E8E6E0' },
];

export const isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test((hex || '').trim());
