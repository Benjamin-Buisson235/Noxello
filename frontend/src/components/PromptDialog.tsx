import type { CSSProperties } from 'react';

type PromptDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  value: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  overlayStyle: CSSProperties;
  dialogStyle: CSSProperties;
  dialogButtonsStyle: CSSProperties;
};

function PromptDialog({
  open,
  title,
  description,
  value,
  placeholder,
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  onChange,
  onConfirm,
  onCancel,
  overlayStyle,
  dialogStyle,
  dialogButtonsStyle,
}: PromptDialogProps) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>{title}</h3>
        {description && (
          <p
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 13,
              color: 'rgba(226,232,240,0.85)',
            }}
          >
            {description}
          </p>
        )}
        <input
          className="input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onConfirm();
            }
          }}
        />
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

export default PromptDialog;
