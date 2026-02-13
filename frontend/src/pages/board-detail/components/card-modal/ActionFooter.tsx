import type { CSSProperties } from 'react';

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
  dialogButtonsStyle: CSSProperties;
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
  let statusText = '';
  let statusColor = 'rgba(226,232,240,0.9)';

  if (isDirty) {
    statusText = 'Unsaved changes';
  } else if (saveStatus === 'saved') {
    statusText = 'Saved ✓';
    statusColor = 'rgba(125, 247, 200, 0.95)';
  } else if (saveStatus === 'saving') {
    statusText = 'Saving…';
  } else if (saveStatus === 'error') {
    statusText = saveError || 'Unable to save';
    statusColor = 'rgba(248, 113, 113, 0.95)';
  }

  return (
    <>
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: statusColor, minHeight: 16 }}>
          {statusText || ' '}
        </span>
        <div style={{ ...dialogButtonsStyle, marginTop: 0 }}>
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
