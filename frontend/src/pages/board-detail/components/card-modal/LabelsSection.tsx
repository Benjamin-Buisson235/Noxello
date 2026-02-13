import { getLabelTextColor } from '../../utils';
import { labelStyle, sectionColumnStyle } from './styles';

type LabelsSectionProps = {
  boardLabels: any[];
  selectedLabelIds: number[];
  onToggleLabel: (labelId: number) => void;
  onOpenManager: () => void;
};

function LabelsSection({
  boardLabels,
  selectedLabelIds,
  onToggleLabel,
  onOpenManager,
}: LabelsSectionProps) {
  const selectedLabels = boardLabels.filter((label: any) =>
    selectedLabelIds.includes(label.id)
  );

  return (
    <div style={sectionColumnStyle}>
      <label style={labelStyle}>Labels</label>
      {selectedLabels.length === 0 ? (
        <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.7)' }}>
          No labels assigned.
        </span>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {selectedLabels.map((label: any) => (
            <span
              key={label.id}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                border: '1px solid rgba(157,78,221,0.5)',
                backgroundColor: label.color || 'rgba(157,78,221,0.25)',
                color: getLabelTextColor(label.color),
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
      <button type="button" className="button button-ghost" onClick={onOpenManager}>
        Manage labels
      </button>
    </div>
  );
}

export default LabelsSection;
