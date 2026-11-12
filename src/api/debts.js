/**
 * API layer for the KRD recruitment endpoints.
 *
 * Endpoints (see API_Methods.html):
 *  - GET  https://rekrutacja-webhosting-it.krd.pl/api/Recruitment/GetTopDebts
 *  - POST https://rekrutacja-webhosting-it.krd.pl/api/Recruitment/GetFilteredDebts
 *  - GET  https://rekrutacja-webhosting-it.krd.pl/api/Recruitment/GetDebtsCount
 *
 * The base URL can be overridden with the VITE_API_BASE_URL environment
 * variable (useful for tests or a local mock server).
 */

const DEFAULT_BASE_URL = 'https://rekrutacja-webhosting-it.krd.pl/api/Recruitment';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  DEFAULT_BASE_URL;

/** Minimum phrase length accepted by GetFilteredDebts (shorter -> HTTP 405). */
export const MIN_PHRASE_LENGTH = 3;

/**
 * Error thrown for non-2xx API responses.
 * `status` holds the HTTP status code (0 when the request never completed).
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Normalises a raw API response into a parsed value.
 * Throws ApiError for non-2xx statuses.
 *
 * @param {Response} response - fetch Response object
 * @param {string} [fallbackMessage] - message used when the body has no text
 * @returns {Promise<*>} parsed JSON (or raw text when not JSON)
 */
async function parseResponse(response, fallbackMessage = 'Błąd połączenia z serwerem') {
  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const text = await response.text();
      if (text) {
        message = text;
      }
    } catch {
      /* keep fallback message */
    }
    throw new ApiError(message, response.status);
  }

  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Returns the TOP 10 debts.
 *
 * @param {AbortSignal} [signal] - optional AbortSignal for cancellation
 * @returns {Promise<Array>} array of Debt objects
 */
export async function getTopDebts(signal) {
  const response = await fetch(`${API_BASE_URL}/GetTopDebts`, {
    method: 'GET',
    signal,
  });
  return parseResponse(response, 'Nie udało się pobrać listy wierzytelności');
}

/**
 * Returns debts filtered by a phrase (searched in Name, NIP and Number).
 * The API answers with HTTP 405 when the phrase is shorter than 3 characters,
 * so the client never sends such phrases (see `isPhraseValid`).
 *
 * @param {string} phrase - search phrase (>= 3 characters)
 * @param {AbortSignal} [signal] - optional AbortSignal for cancellation
 * @returns {Promise<Array>} array of Debt objects
 */
export async function getFilteredDebts(phrase, signal) {
  const response = await fetch(`${API_BASE_URL}/GetFilteredDebts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase }),
    signal,
  });
  return parseResponse(response, 'Nie udało się pobrać wyników wyszukiwania');
}

/**
 * Returns the total number of debts in the system.
 *
 * @param {AbortSignal} [signal] - optional AbortSignal for cancellation
 * @returns {Promise<number>} single number
 */
export async function getDebtsCount(signal) {
  const response = await fetch(`${API_BASE_URL}/GetDebtsCount`, {
    method: 'GET',
    signal,
  });
  const value = await parseResponse(response, 'Nie udało się pobrać liczby wierzytelności');
  return typeof value === 'number' ? value : Number(value);
}

/**
 * Client-side validation: the API rejects phrases shorter than 3 characters
 * with HTTP 405, so we avoid sending them at all.
 *
 * @param {string} phrase
 * @returns {boolean} true when the phrase may be sent to the API
 */
export function isPhraseValid(phrase) {
  return typeof phrase === 'string' && phrase.trim().length >= MIN_PHRASE_LENGTH;
}
