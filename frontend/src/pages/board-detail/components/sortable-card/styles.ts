const card = {
  borderRadius: 8,
  padding: '6px 8px',
  backgroundColor: 'rgba(11, 15, 35, 0.9)',
  border: '1px solid rgba(157,78,221,0.55)',
  fontSize: 12,
  color: '#f9f5ff',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
};

const content = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
};

const header = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

const editButton = {
  padding: '2px 6px',
  fontSize: 10,
  lineHeight: 1,
};

const actionsRow = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 4,
};

const actionButton = {
  padding: '2px 6px',
  fontSize: 10,
  lineHeight: 1,
};

const labelsRow = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 4,
};

const labelPill = {
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 999,
  border: '1px solid rgba(157,78,221,0.4)',
  color: '#f9f5ff',
};

const dueRow = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
};

const duePill = {
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 999,
  border: '1px solid rgba(157,78,221,0.4)',
};

const overdueText = {
  fontSize: 10,
  color: 'rgba(248, 113, 113, 0.9)',
};

const checklistText = {
  fontSize: 10,
  color: 'rgba(226,232,240,0.8)',
};

export const sortableCardStyles = {
  card,
  content,
  header,
  editButton,
  actionsRow,
  actionButton,
  labelsRow,
  labelPill,
  dueRow,
  duePill,
  overdueText,
  checklistText,
};
