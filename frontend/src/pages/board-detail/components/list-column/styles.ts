const column = {
  minWidth: 220,
  maxWidth: 260,
  borderRadius: 12,
  padding: 10,
  background: 'linear-gradient(145deg, rgba(55,10,98,0.96), rgba(92,28,168,0.96))',
  border: '1px solid rgba(199,125,255,0.75)',
  maxHeight: '70vh',
  display: 'flex',
  flexDirection: 'column' as const,
  minHeight: 0,
};

const header = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
  marginBottom: 4,
};

const title = {
  margin: 0,
  fontSize: 15,
  color: '#fdfcff',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
};

const actionsRow = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 6,
};

const actionsGroup = {
  display: 'flex',
  gap: 3,
};

const actionButton = {
  padding: '2px 6px',
  fontSize: 10,
  lineHeight: 1,
};

const meta = {
  margin: 0,
  fontSize: 11,
  color: 'rgba(226,232,240,0.9)',
};

const metaSecondary = {
  margin: 0,
  marginTop: 2,
  fontSize: 11,
  color: 'rgba(226,232,240,0.75)',
};

const addFormInput = {
  width: '100%',
  borderRadius: 8,
  padding: 6,
  border: '1px solid rgba(199,125,255,0.7)',
  backgroundColor: 'rgba(6, 5, 24, 0.95)',
  color: '#f9f5ff',
  fontSize: 12,
  marginBottom: 6,
};

const addFormActions = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
};

const addFormPrimaryButton = {
  padding: '4px 10px',
  fontSize: 12,
};

const addFormCancelButton = {
  padding: '4px 8px',
  fontSize: 12,
};

const addCardButton = {
  marginTop: 2,
  borderRadius: 8,
  padding: '6px 8px',
  width: '100%',
  textAlign: 'left' as const,
  fontSize: 12,
  border: '1px dashed rgba(199,125,255,0.6)',
  backgroundColor: 'transparent',
  color: 'rgba(240, 237, 255, 0.9)',
  cursor: 'pointer',
};

export const listColumnStyles = {
  column,
  header,
  title,
  actionsRow,
  actionsGroup,
  actionButton,
  meta,
  metaSecondary,
  addFormInput,
  addFormActions,
  addFormPrimaryButton,
  addFormCancelButton,
  addCardButton,
};
