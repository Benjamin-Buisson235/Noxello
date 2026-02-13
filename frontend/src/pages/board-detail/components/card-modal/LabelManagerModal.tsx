import { useState } from 'react';
import type { CSSProperties } from 'react';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import {
  colorInputStyle,
  colorSwatchButton,
  colorSwatchesRow,
  inputStyle,
  labelStyle,
  rowStyle,
  sectionColumnStyle,
} from './styles';

type LabelManagerModalProps = {
  open: boolean;
  boardLabels: any[];
  selectedLabelIds: number[];
  newLabelName: string;
  newLabelColor: string;
  onToggleLabel: (labelId: number) => void;
  onCreateLabel: () => void;
  onDeleteLabel: (labelId: number) => void;
  onChangeNewLabelName: (value: string) => void;
  onChangeNewLabelColor: (value: string) => void;
  onClose: () => void;
  overlayStyle: CSSProperties;
  dialogStyle: CSSProperties;
  dialogButtonsStyle: CSSProperties;
};

function LabelManagerModal({
  open,
  boardLabels,
  selectedLabelIds,
  newLabelName,
  newLabelColor,
  onToggleLabel,
  onCreateLabel,
  onDeleteLabel,
  onChangeNewLabelName,
  onChangeNewLabelColor,
  onClose,
  overlayStyle,
  dialogStyle,
  dialogButtonsStyle,
}: LabelManagerModalProps) {
  if (!open) return null;

  const [labelToDelete, setLabelToDelete] = useState<{ id: number; name: string } | null>(
    null
  );

  const modalStyle: CSSProperties = {
    ...dialogStyle,
    width: 'min(92vw, 520px)',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const bodyStyle: CSSProperties = {
    overflowY: 'auto',
    paddingRight: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const palette = [
    '#f43f5e',
    '#f97316',
    '#facc15',
    '#22c55e',
    '#38bdf8',
    '#6366f1',
    '#a855f7',
    '#ec4899',
  ];
  const isHexColor = /^#([0-9a-fA-F]{6})$/.test(newLabelColor);
  const colorValue = isHexColor ? newLabelColor : '#8b5cf6';

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Manage labels</h3>

        <div style={bodyStyle}>
          <div style={sectionColumnStyle}>
            <label style={labelStyle}>Assign labels</label>
            {boardLabels.length === 0 ? (
              <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.7)' }}>
                No labels yet.
              </span>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '6px 16px',
                }}
              >
                {boardLabels.map((label: any) => (
                  <label
                    key={label.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12,
                      color: '#f9f5ff',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLabelIds.includes(label.id)}
                      onChange={() => onToggleLabel(label.id)}
                    />
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 4,
                        backgroundColor: label.color || 'rgba(157,78,221,0.6)',
                        border: '1px solid rgba(199,125,255,0.6)',
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        lineHeight: 1.3,
                      }}
                    >
                      {label.name}
                    </span>
                    <button
                      type="button"
                      className="button button-ghost"
                      style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: 10 }}
                      onClick={() => setLabelToDelete({ id: label.id, name: label.name })}
                    >
                      Delete
                    </button>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={sectionColumnStyle}>
            <label style={labelStyle}>Create label</label>
            <div style={rowStyle}>
              <input
                type="text"
                placeholder="New label name"
                value={newLabelName}
                onChange={(e) => onChangeNewLabelName(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" className="button button-ghost" onClick={onCreateLabel}>
                Add
              </button>
            </div>
            <div style={colorSwatchesRow}>
              {palette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChangeNewLabelColor(color)}
                  title={color}
                  style={{
                    ...colorSwatchButton,
                    backgroundColor: color,
                    boxShadow:
                      newLabelColor === color
                        ? '0 0 0 2px rgba(199,125,255,0.6)'
                        : 'none',
                  }}
                />
              ))}
              <input
                type="color"
                value={colorValue}
                onChange={(e) => onChangeNewLabelColor(e.target.value)}
                style={colorInputStyle}
                title="Custom color"
              />
              <button
                type="button"
                className="button button-ghost"
                onClick={() => onChangeNewLabelColor('#ffffff')}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div style={dialogButtonsStyle}>
          <button className="button button-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <ConfirmDialog
          open={!!labelToDelete}
          title="Delete label"
          description={`Delete label \"${labelToDelete?.name || ''}\"?`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (labelToDelete) {
              onDeleteLabel(labelToDelete.id);
            }
            setLabelToDelete(null);
          }}
          onCancel={() => setLabelToDelete(null)}
          overlayStyle={overlayStyle}
          dialogStyle={dialogStyle}
          dialogButtonsStyle={dialogButtonsStyle}
        />
      </div>
    </div>
  );
}

export default LabelManagerModal;
