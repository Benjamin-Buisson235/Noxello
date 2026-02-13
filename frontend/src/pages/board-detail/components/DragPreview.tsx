import { toDateInputValue } from '../utils';

type DragPreviewProps = {
  card: any | null;
};

function DragPreview({ card }: DragPreviewProps) {
  if (!card) return null;

  return (
    <div
      className="card-item card-item--preview"
      style={{
        borderRadius: 10,
        padding: '8px 10px',
        backgroundColor: 'rgba(11, 15, 35, 0.98)',
        border: '1px solid rgba(157,78,221,0.85)',
        fontSize: 12,
        color: '#f9f5ff',
        boxShadow: '0 16px 32px rgba(0,0,0,0.55)',
        pointerEvents: 'none',
        maxWidth: 260,
        minWidth: 180,
        wordBreak: 'break-word',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {card.title || 'Untitled'}
      </div>
      {card.dueDate && (
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 999,
            border: '1px solid rgba(157,78,221,0.5)',
            color: 'rgba(226,232,240,0.9)',
          }}
        >
          Due: {toDateInputValue(card.dueDate)}
        </span>
      )}
    </div>
  );
}

export default DragPreview;
