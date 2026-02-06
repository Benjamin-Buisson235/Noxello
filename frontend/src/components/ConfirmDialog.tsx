import type { CSSProperties } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  note?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  overlayStyle: CSSProperties;
  dialogStyle: CSSProperties;
  dialogButtonsStyle: CSSProperties;
};

function ConfirmDialog({
  open,
  title,
  description,
  note,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  overlayStyle,
  dialogStyle,
  dialogButtonsStyle,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>{title}</h3>
        <p
          style={{
            margin: 0,
            marginBottom: 4,
            fontSize: 14,
            color: 'rgba(226,232,240,0.95)',
          }}
        >
          {description}
        </p>
        {note && (
          <p
            style={{
              margin: 0,
              marginTop: 4,
              fontSize: 12,
              color: 'rgba(226,232,240,0.7)',
            }}
          >
            {note}
          </p>
        )}
        <div style={dialogButtonsStyle}>
          <button className="button button-ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="button button-primary" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
