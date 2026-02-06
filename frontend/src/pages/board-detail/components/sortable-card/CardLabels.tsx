import { sortableCardStyles } from './styles';

type CardLabelsProps = {
  labels: Array<{ id: number; name: string; color?: string | null }>;
};

function CardLabels({ labels }: CardLabelsProps) {
  if (labels.length === 0) return null;

  return (
    <div style={sortableCardStyles.labelsRow}>
      {labels.map((label) => (
        <span
          key={label.id}
          style={{
            ...sortableCardStyles.labelPill,
            backgroundColor: label.color || 'rgba(157,78,221,0.25)',
          }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}

export default CardLabels;
