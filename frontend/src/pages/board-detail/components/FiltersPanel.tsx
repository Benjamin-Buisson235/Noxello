type FiltersPanelProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFilter: 'all' | 'overdue' | 'dueSoon';
  onDateFilterChange: (value: 'all' | 'overdue' | 'dueSoon') => void;
  boardLabels: any[];
  filterLabelIds: number[];
  onLabelFilterChange: (labelId: number | null) => void;
  filtersActive: boolean;
  resultCount: number;
  onClearFilters: () => void;
};

function FiltersPanel({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  boardLabels,
  filterLabelIds,
  onLabelFilterChange,
  filtersActive,
  resultCount,
  onClearFilters,
}: FiltersPanelProps) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Search & filters</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <input
            className="input"
            type="text"
            placeholder="Search cards (title or description)"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            style={{ minWidth: 220, flex: 1 }}
          />
          {filtersActive && (
            <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.85)' }}>
              {resultCount} results
            </span>
          )}
          <button
            type="button"
            className="button button-ghost"
            onClick={onClearFilters}
            disabled={!filtersActive}
          >
            Clear filters
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.85)' }}>
              Date
            </span>
            <select
              value={dateFilter}
              onChange={(event) =>
                onDateFilterChange(event.target.value as 'all' | 'overdue' | 'dueSoon')
              }
              style={{
                minWidth: 140,
                borderRadius: 8,
                padding: '6px 8px',
                border: '1px solid rgba(199,125,255,0.7)',
                backgroundColor: 'rgba(6, 5, 24, 0.95)',
                color: '#f9f5ff',
                fontSize: 12,
              }}
            >
              <option value="all">All dates</option>
              <option value="overdue">Overdue</option>
              <option value="dueSoon">Due soon (7 days)</option>
            </select>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.85)' }}>
              Labels
            </span>
            <select
              value={filterLabelIds[0] ? String(filterLabelIds[0]) : ''}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!event.target.value) {
                  onLabelFilterChange(null);
                  return;
                }
                if (Number.isNaN(value)) return;
                onLabelFilterChange(value);
              }}
              style={{
                minWidth: 180,
                borderRadius: 8,
                padding: '6px 8px',
                border: '1px solid rgba(199,125,255,0.7)',
                backgroundColor: 'rgba(6, 5, 24, 0.95)',
                color: '#f9f5ff',
                fontSize: 12,
              }}
              disabled={boardLabels.length === 0}
            >
              <option value="">All labels</option>
              {boardLabels.map((label: any) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FiltersPanel;
