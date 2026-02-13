import type { CSSProperties } from 'react';

export const sectionColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const labelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'rgba(226,232,240,0.9)',
};

export const inputStyle: CSSProperties = {
  borderRadius: 8,
  padding: '6px 8px',
  border: '1px solid rgba(199,125,255,0.7)',
  backgroundColor: 'rgba(6, 5, 24, 0.95)',
  color: '#f9f5ff',
  fontSize: 12,
};

export const textareaStyle: CSSProperties = {
  width: '100%',
  borderRadius: 8,
  padding: 8,
  border: '1px solid rgba(199,125,255,0.7)',
  backgroundColor: 'rgba(6, 5, 24, 0.95)',
  color: '#f9f5ff',
  fontSize: 12,
  resize: 'vertical',
};

export const rowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

export const colorSwatchesRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
};

export const colorSwatchButton: CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 6,
  border: '1px solid rgba(199,125,255,0.6)',
  padding: 0,
  cursor: 'pointer',
};

export const colorInputStyle: CSSProperties = {
  width: 40,
  height: 32,
  borderRadius: 8,
  border: '1px solid rgba(199,125,255,0.7)',
  backgroundColor: 'rgba(6, 5, 24, 0.95)',
  padding: 0,
  cursor: 'pointer',
};
