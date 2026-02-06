import React from 'react';

type ActionFooterProps = {
  isDirty: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string;
  isArchived: boolean;
  onCancel: () => void;
  onSave: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  dialogButtonsStyle: React.CSSProperties;
};

function ActionFooter({
  isDirty,
  saveStatus,
  saveError,
  isArchived,
  onCancel,
  onSave,
  onArchive,
  onUnarchive,
  onDelete,
  dialogButtonsStyle,
}: ActionFooterProps) {
  return (
    <>
      <div style={{ marginTop: 10, fontSize: 12 }}>
        {isDirty && (
          <span style={{ color: 'rgba(226,232,240,0.9)' }}>Unsaved changes</span>
        )}
        {!isDirty && saveStatus === 'saved' && (
          <span style={{ color: 'rgba(125, 247, 200, 0.95)' }}>Saved ✓</span>
        )}
        {saveStatus === 'saving' && (
          <span style={{ color: 'rgba(226,232,240,0.9)' }}>Saving…</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ color: 'rgba(248, 113, 113, 0.95)' }}>
            {saveError || 'Unable to save'}
          </span>
        )}
      </div>
      <div style={dialogButtonsStyle}>
        <button className="button button-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="button button-primary"
          type="button"
          onClick={onSave}
          disabled={saveStatus === 'saving'}
        >
          Save
        </button>
      </div>
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        {!isArchived ? (
          <button className="button button-primary" type="button" onClick={onArchive}>
            Archive
          </button>
        ) : (
          <button className="button button-primary" type="button" onClick={onUnarchive}>
            Unarchive
          </button>
        )}
        <button
          className="button button-ghost"
          type="button"
          onClick={onDelete}
          style={{ color: 'rgba(248, 113, 113, 0.95)' }}
        >
          Delete
        </button>
      </div>
    </>
  );
}

export default ActionFooter;
