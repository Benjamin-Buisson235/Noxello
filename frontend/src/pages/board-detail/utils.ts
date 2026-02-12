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

const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('#')) return null;
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (trimmed.length === 7) return trimmed;
  return null;
};

export const getLabelTextColor = (color?: string | null) => {
  if (!color) return '#f9f5ff';
  const hex = normalizeHex(color);
  if (!hex) return '#f9f5ff';
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0b0b0b' : '#f9f5ff';
};
