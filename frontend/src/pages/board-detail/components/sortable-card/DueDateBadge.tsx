import { sortableCardStyles } from './styles';

type DueDateBadgeProps = {
  label: string;
  isOverdue: boolean;
};

function DueDateBadge({ label, isOverdue }: DueDateBadgeProps) {
  return (
    <div style={sortableCardStyles.dueRow}>
      <span
        style={{
          ...sortableCardStyles.duePill,
          color: isOverdue ? 'rgba(248, 113, 113, 0.95)' : '#f9f5ff',
          backgroundColor: isOverdue
            ? 'rgba(248, 113, 113, 0.15)'
            : 'rgba(157,78,221,0.25)',
        }}
      >
        Due: {label}
      </span>
      {isOverdue && <span style={sortableCardStyles.overdueText}>Overdue</span>}
    </div>
  );
}

export default DueDateBadge;
