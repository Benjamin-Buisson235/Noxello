import { toDateInputValue } from './utils';

type DateFilter = 'all' | 'overdue' | 'dueSoon';

type FilterParams = {
  lists: any[];
  searchQuery: string;
  dateFilter: DateFilter;
  filterLabelIds: number[];
};

type FilterResult = {
  filteredLists: any[];
  resultCount: number;
  filtersActive: boolean;
};

export const buildFilteredLists = ({
  lists,
  searchQuery,
  dateFilter,
  filterLabelIds,
}: FilterParams): FilterResult => {
  const filtersActive =
    searchQuery.trim() !== '' || dateFilter !== 'all' || filterLabelIds.length > 0;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueSoonLimit = new Date(today);
  dueSoonLimit.setDate(today.getDate() + 7);

  const filteredLists = lists.map((list: any) => {
    const cards = list.cards || [];
    const filteredCards = cards.filter((card: any) => {
      if (normalizedQuery) {
        const title = (card.title || '').toLowerCase();
        const description = (card.description || '').toLowerCase();
        if (!title.includes(normalizedQuery) && !description.includes(normalizedQuery)) {
          return false;
        }
      }

      if (filterLabelIds.length > 0) {
        const cardLabelIds = (card.cardLabels || [])
          .map((entry: any) => entry.label?.id ?? entry.labelId)
          .filter((value: any) => Number.isFinite(value));
        const hasAnyLabel = filterLabelIds.some((labelId) =>
          cardLabelIds.includes(labelId)
        );
        if (!hasAnyLabel) {
          return false;
        }
      }

      if (dateFilter !== 'all') {
        const dueLabel = toDateInputValue(card.dueDate);
        if (!dueLabel) {
          return false;
        }
        const dueDate = new Date(`${dueLabel}T00:00:00`);
        if (dateFilter === 'overdue' && !(dueDate < today)) {
          return false;
        }
        if (dateFilter === 'dueSoon' && (dueDate < today || dueDate > dueSoonLimit)) {
          return false;
        }
      }

      return true;
    });

    return { ...list, cards: filteredCards };
  });

  const resultCount = filteredLists.reduce(
    (sum: number, list: any) => sum + (list.cards || []).length,
    0
  );

  return { filteredLists, resultCount, filtersActive };
};
