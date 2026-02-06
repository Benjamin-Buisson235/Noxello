export const toCardDndId = (cardId: number) => `card-${cardId}`;
export const toListDndId = (listId: number) => `list-${listId}`;

export const parseCardId = (dndId: string | number) => {
  const value = String(dndId);
  if (!value.startsWith('card-')) return null;
  const parsed = Number(value.replace('card-', ''));
  return Number.isNaN(parsed) ? null : parsed;
};

export const parseListId = (dndId: string | number) => {
  const value = String(dndId);
  if (!value.startsWith('list-')) return null;
  const parsed = Number(value.replace('list-', ''));
  return Number.isNaN(parsed) ? null : parsed;
};

export const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  return value.slice(0, 10);
};

export const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const sameLabelIds = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((value, index) => value === sortedB[index]);
};
