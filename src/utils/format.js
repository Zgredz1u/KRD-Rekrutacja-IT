/**
 * Display formatting helpers.
 *
 * The API does not specify a currency, so amounts are formatted with the
 * Polish convention: space as the thousands separator and a comma as the
 * decimal separator, two decimal places, no currency symbol.
 *
 * Formatting is implemented manually (instead of `Intl.NumberFormat`) so
 * that the output is identical in every environment (Node, Chrome,
 * Firefox, Edge) regardless of the installed ICU locale data.
 *
 * Dates are displayed as dd-mm-yyyy (per the design mockup).
 */

/**
 * Groups the integer part of a string of digits with a space every 3 digits.
 *
 * @param {string} digits - e.g. "10000"
 * @returns {string} e.g. "10 000"
 */
function groupDigits(digits) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Formats a debt amount for display, e.g. 10000 -> "10 000,00".
 *
 * @param {number|string|null} value
 * @returns {string}
 */
export function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return String(value);
  }

  const negative = num < 0;
  const [intPart, decPart] = Math.abs(num).toFixed(2).split('.');
  return `${negative ? '-' : ''}${groupDigits(intPart)},${decPart}`;
}

/**
 * Formats an ISO 8601 date string as dd-mm-yyyy.
 * The date part is parsed manually (regex on the first 10 characters) so
 * that no timezone conversion can shift the day.
 *
 * @param {string} isoDate - e.g. "2017-03-01T00:00:00"
 * @returns {string} e.g. "01-03-2017"
 */
export function formatDate(isoDate) {
  const datePart = String(isoDate ?? '').slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) {
    return String(isoDate ?? '');
  }
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

/**
 * Formats a NIP for display. The API documents NIP as a string, so it is
 * rendered as-is (no numeric parsing, no padding).
 *
 * @param {string|number|null} nip
 * @returns {string}
 */
export function formatNip(nip) {
  return String(nip ?? '');
}
