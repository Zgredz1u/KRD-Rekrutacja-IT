/**
 * Sorting helpers for the debts table.
 *
 * Rules (per Task.pdf / API_Methods.html):
 *  - Name  -> locale-aware string comparison (Polish), case-insensitive
 *  - NIP   -> compared as a STRING (the API documents NIP as a string,
 *             it must not be parsed as a number)
 *  - Value -> numeric comparison
 *  - Date  -> chronological comparison; the ISO 8601 date part is parsed
 *             manually (split on '-') so that no timezone conversion can
 *             shift the day
 */

/**
 * Extracts a comparable key from a debt for the given column.
 *
 * @param {object} debt - Debt entity
 * @param {string} column - one of 'name' | 'nip' | 'value' | 'date'
 * @returns {string|number} comparable key
 */
export function getSortKey(debt, column) {
  switch (column) {
    case 'name':
      return String(debt.Name || '').toLocaleLowerCase('pl');
    case 'nip':
      return String(debt.NIP || '');
    case 'value':
      return Number(debt.Value) || 0;
    case 'date':
      return parseDateKey(debt.Date);
    default:
      return '';
  }
}

/**
 * Parses an ISO 8601 date string into a zero-padded "YYYYMMDD" key.
 * Only the date part is used (the API returns midnight timestamps).
 * Manual parsing avoids timezone day-shifts from `new Date(str)`.
 *
 * @param {string} isoDate - e.g. "2017-03-01T00:00:00"
 * @returns {string} e.g. "20170301"
 */
export function parseDateKey(isoDate) {
  const datePart = String(isoDate || '').slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) {
    return '00000000';
  }
  return `${match[1]}${match[2]}${match[3]}`;
}

/**
 * Compares two debts by the given column (ascending).
 *
 * @param {object} a
 * @param {object} b
 * @param {string} column
 * @returns {number} negative / zero / positive
 */
export function compareDebts(a, b, column) {
  const keyA = getSortKey(a, column);
  const keyB = getSortKey(b, column);

  if (typeof keyA === 'number' && typeof keyB === 'number') {
    return keyA - keyB;
  }
  // String keys (name, nip, date) are compared with Polish locale
  // collation so that diacritics (ł, ś, ż, ...) sort as their base
  // letters, matching the expected "rosnąco po nazwie dłużnika" order.
  return String(keyA).localeCompare(String(keyB), 'pl');
}

/**
 * Returns a NEW array of debts sorted by column and direction.
 * The input array is never mutated.
 *
 * @param {Array} debts - array of Debt objects
 * @param {string} column - 'name' | 'nip' | 'value' | 'date'
 * @param {string} direction - 'asc' | 'desc'
 * @returns {Array} sorted copy
 */
export function sortDebts(debts, column, direction) {
  const factor = direction === 'desc' ? -1 : 1;
  return [...debts].sort((a, b) => factor * compareDebts(a, b, column));
}
