import { toLocalDateString } from '../../utils';
import DatePicker from './DatePicker';
import { labelStyle, rowStyle, sectionColumnStyle, textareaStyle } from './styles';

type DetailsSectionProps = {
  editCardTitle: string;
  editCardDescription: string;
  editCardDueDate: string;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeDueDate: (value: string) => void;
  onClearDueDate: () => void;
};

function DetailsSection({
  editCardTitle,
  editCardDescription,
  editCardDueDate,
  onChangeTitle,
  onChangeDescription,
  onChangeDueDate,
  onClearDueDate,
}: DetailsSectionProps) {
  const todayLabel = toLocalDateString(new Date());
  const isOverdue = !!editCardDueDate && editCardDueDate < todayLabel;

  return (
    <>
      <div style={sectionColumnStyle}>
        <label style={labelStyle}>Title</label>
        <input
          className="input"
          type="text"
          value={editCardTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
      </div>
      <div style={sectionColumnStyle}>
        <label style={labelStyle}>Description</label>
        <textarea
          value={editCardDescription}
          onChange={(e) => onChangeDescription(e.target.value)}
          rows={4}
          style={textareaStyle}
        />
      </div>
      <div style={sectionColumnStyle}>
        <label style={labelStyle}>Due date</label>
        <div
          style={{
            ...rowStyle,
            alignItems: 'center',
            padding: 10,
            borderRadius: 10,
            backgroundColor: 'rgba(11, 15, 35, 0.6)',
            border: '1px solid rgba(157,78,221,0.35)',
          }}
        >
          <DatePicker
            value={editCardDueDate}
            onChange={onChangeDueDate}
            onClear={onClearDueDate}
          />
        </div>
        {editCardDueDate && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 12,
              border: '1px solid rgba(157,78,221,0.5)',
              backgroundColor: isOverdue
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(11, 15, 35, 0.7)',
              color: isOverdue ? '#fecaca' : '#f9f5ff',
            }}
          >
            <span>Due: {editCardDueDate}</span>
            {isOverdue && <span style={{ fontWeight: 600 }}>Overdue</span>}
          </div>
        )}
      </div>
    </>
  );
}

export default DetailsSection;
