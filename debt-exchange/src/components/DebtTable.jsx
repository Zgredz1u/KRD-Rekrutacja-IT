import { formatDate, formatNip, formatValue } from '../utils/format';
import './DebtTable.less';

/**
 * Table columns, in the order shown by the design mockup.
 * `key` is the sort column id, `label` the Polish header text.
 */
const COLUMNS = [
  { key: 'name', label: 'DŁUŻNIK' },
  { key: 'nip', label: 'NIP' },
  { key: 'value', label: 'KWOTA ZADŁUŻENIA' },
  { key: 'date', label: 'DATA POWSTANIA ZOBOWIĄZANIA' },
];

/**
 * Renders one cell value according to the column.
 */
function renderCell(debt, columnKey) {
  switch (columnKey) {
    case 'name':
      return debt.Name;
    case 'nip':
      return formatNip(debt.NIP);
    case 'value':
      return formatValue(debt.Value);
    case 'date':
      return formatDate(debt.Date);
    default:
      return '';
  }
}

/**
 * Sortable debts table.
 *
 * @param {Array} debts - debts to display (already sorted by the parent)
 * @param {string} sortColumn - currently sorted column ('name' | 'nip' | 'value' | 'date')
 * @param {string} sortDirection - 'asc' | 'desc'
 * @param {(column: string) => void} onSort - called with the clicked column key
 * @param {boolean} loading - disables interaction while a request is in flight
 */
export default function DebtTable({ debts, sortColumn, sortDirection, onSort, loading }) {
  return (
    <div className="table-wrap">
      <table className="table" aria-busy={loading}>
        <thead className="table__head">
          <tr className="table__row table__row--header">
            {COLUMNS.map((column) => {
              const active = column.key === sortColumn;
              const arrow = active ? (sortDirection === 'asc' ? '▼' : '▲') : '';
              return (
                <th
                  key={column.key}
                  className="table__header-cell"
                  scope="col"
                  aria-sort={active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <button
                    type="button"
                    className={`table__sort${active ? ' table__sort--active' : ''}`}
                    onClick={() => onSort(column.key)}
                    disabled={loading}
                  >
                    <span className="table__sort-label">{column.label}</span>
                    <span className="table__sort-arrow" aria-hidden="true">
                      {arrow}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="table__body">
          {debts.length === 0 ? (
            <tr className="table__row">
              <td className="table__cell table__cell--empty" colSpan={COLUMNS.length}>
                Brak wyników
              </td>
            </tr>
          ) : (
            debts.map((debt) => (
              <tr key={debt.Id} className="table__row">
                {COLUMNS.map((column) => (
                  <td key={column.key} className="table__cell">
                    {renderCell(debt, column.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
