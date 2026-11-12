import { useCallback, useMemo, useState } from 'react';
import SearchForm from './components/SearchForm';
import DebtTable from './components/DebtTable';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import { useDebts } from './hooks/useDebts';
import { sortDebts } from './utils/sort';
import './App.less';

/**
 * Default table state: sorted ascending by debtor name
 * (per Task.pdf: "Stanem domyślnym tabeli jest jej posortowanie
 * rosnąco po nazwie dłużnika").
 */
const DEFAULT_SORT = { column: 'name', direction: 'asc' };

export default function App() {
  const { debts, loading, error, phrase, search, reset } = useDebts();
  const [sort, setSort] = useState(DEFAULT_SORT);

  // Clicking the active column toggles its direction; clicking another
  // column sorts ascending by that column.
  const handleSort = useCallback((column) => {
    setSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    );
  }, []);

  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  const sortedDebts = useMemo(
    () => sortDebts(debts, sort.column, sort.direction),
    [debts, sort]
  );

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <SearchForm onSearch={search} loading={loading} />
        </div>
      </header>

      <main className="app__main">
        <div className="app__content">
          {error ? (
            <ErrorMessage message={error} onRetry={handleRetry} />
          ) : (
            <>
              {loading && <Loader />}
              <DebtTable
                debts={sortedDebts}
                sortColumn={sort.column}
                sortDirection={sort.direction}
                onSort={handleSort}
                loading={loading}
              />
              {!loading && phrase.trim() !== '' && sortedDebts.length === 0 && (
                <p className="app__hint">
                  Brak wierzytelności dla frazy „{phrase.trim()}”.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
