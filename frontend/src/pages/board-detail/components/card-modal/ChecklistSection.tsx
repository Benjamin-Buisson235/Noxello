import { inputStyle, labelStyle, rowStyle, sectionColumnStyle } from './styles';

type ChecklistSectionProps = {
  checklistItems: any[];
  checklistDoneCount: number;
  checklistTotalCount: number;
  newChecklistText: string;
  onToggleChecklistItem: (itemId: number, done: boolean) => void;
  onChecklistTextChange: (itemId: number, text: string) => void;
  onSaveChecklistText: (itemId: number, text: string) => void;
  onReorderChecklistItem: (itemId: number, direction: 'up' | 'down') => void;
  onDeleteChecklistItem: (itemId: number) => void;
  onAddChecklistItem: () => void;
  onChangeNewChecklistText: (value: string) => void;
};

function ChecklistSection({
  checklistItems,
  checklistDoneCount,
  checklistTotalCount,
  newChecklistText,
  onToggleChecklistItem,
  onChecklistTextChange,
  onSaveChecklistText,
  onReorderChecklistItem,
  onDeleteChecklistItem,
  onAddChecklistItem,
  onChangeNewChecklistText,
}: ChecklistSectionProps) {
  return (
    <div style={sectionColumnStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <label style={labelStyle}>Checklist</label>
        <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.7)' }}>
          {checklistDoneCount} / {checklistTotalCount}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {checklistItems.length === 0 && (
          <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.7)' }}>
            No checklist items yet.
          </span>
        )}
        {checklistItems.map((item: any, index: number) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <input
              type="checkbox"
              checked={!!item.done}
              onChange={(event) => onToggleChecklistItem(item.id, event.target.checked)}
            />
            <input
              type="text"
              value={item.text}
              onChange={(event) => onChecklistTextChange(item.id, event.target.value)}
              onBlur={(event) => onSaveChecklistText(item.id, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onSaveChecklistText(item.id, (event.target as HTMLInputElement).value);
                }
              }}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              className="button button-ghost"
              onClick={() => onReorderChecklistItem(item.id, 'up')}
              disabled={index === 0}
            >
              ↑
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => onReorderChecklistItem(item.id, 'down')}
              disabled={index === checklistItems.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => onDeleteChecklistItem(item.id)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
      <div style={rowStyle}>
        <input
          type="text"
          placeholder="Add checklist item"
          value={newChecklistText}
          onChange={(event) => onChangeNewChecklistText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAddChecklistItem();
            }
          }}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="button" className="button button-ghost" onClick={onAddChecklistItem}>
          Add
        </button>
      </div>
    </div>
  );
}

export default ChecklistSection;
