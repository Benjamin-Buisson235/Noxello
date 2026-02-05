import type { CSSProperties } from 'react';

export const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(3, 0, 20, 0.72)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(3px)',
};

export const dialogStyle: CSSProperties = {
  minWidth: 340,
  maxWidth: 420,
  borderRadius: 20,
  padding: 20,
  background:
    'radial-gradient(circle at top, rgba(157,78,221,0.25), transparent 55%), linear-gradient(145deg, #240046, #10002b)',
  border: '1px solid rgba(199,125,255,0.8)',
  boxShadow: '0 18px 45px rgba(6, 3, 34, 0.9)',
  color: '#f9f5ff',
};

export const dialogButtonsStyle: CSSProperties = {
  marginTop: 18,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
};
