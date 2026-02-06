import { sortableCardStyles } from './styles';

type ChecklistBadgeProps = {
  done: number;
  total: number;
};

function ChecklistBadge({ done, total }: ChecklistBadgeProps) {
  return (
    <span style={sortableCardStyles.checklistText}>
      Checklist {done}/{total}
    </span>
  );
}

export default ChecklistBadge;
