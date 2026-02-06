import { inputStyle, labelStyle, rowStyle, sectionColumnStyle } from './styles';

type LabelsSectionProps = {
  boardLabels: any[];
  selectedLabelIds: number[];
  newLabelName: string;
  newLabelColor: string;
  onToggleLabel: (labelId: number) => void;
  onCreateLabel: () => void;
  onChangeNewLabelName: (value: string) => void;
  onChangeNewLabelColor: (value: string) => void;
};

function LabelsSection({
  boardLabels,
  selectedLabelIds,
  newLabelName,
  newLabelColor,
  onToggleLabel,
  onCreateLabel,
  onChangeNewLabelName,
  onChangeNewLabelColor,
}: LabelsSectionProps) {
  return (
    <div style={sectionColumnStyle}>
      <label style={labelStyle}>Labels</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {boardLabels.length === 0 && (
          <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.7)' }}>
            No labels yet.
          </span>
        )}
        {boardLabels.map((label: any) => (
          <label
            key={label.id}
            style={{
              display: 'flex',
              alignItems: 'center',
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
            <span>{label.name}</span>
          </label>
        ))}
      </div>
      <div style={rowStyle}>
        <input
          type="text"
          placeholder="New label name"
          value={newLabelName}
          onChange={(e) => onChangeNewLabelName(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          type="text"
          placeholder="Color (optional)"
          value={newLabelColor}
          onChange={(e) => onChangeNewLabelColor(e.target.value)}
          style={{ ...inputStyle, width: 120 }}
        />
        <button type="button" className="button button-ghost" onClick={onCreateLabel}>
          Add
        </button>
      </div>
    </div>
  );
}

export default LabelsSection;
