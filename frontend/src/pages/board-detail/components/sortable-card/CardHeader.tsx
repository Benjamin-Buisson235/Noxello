import { sortableCardStyles } from './styles';

type CardHeaderProps = {
  title: string;
  onEdit: () => void;
  showEditButton?: boolean;
};

function CardHeader({ title, onEdit, showEditButton = true }: CardHeaderProps) {
  return (
    <div style={sortableCardStyles.header}>
      <span>{title}</span>
      {showEditButton && (
        <button
          type="button"
          className="button button-ghost"
          style={sortableCardStyles.editButton}
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          title="Edit card"
        >
          ✎
        </button>
      )}
    </div>
  );
}

export default CardHeader;
