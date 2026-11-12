import { useCallback, useEffect, useRef, useState } from 'react';
import { getFilteredDebts, getTopDebts, isPhraseValid } from '../api/debts';

/**
 * Loads debts from the API and keeps them in sync with the current
 * search phrase.
 *
 * Behaviour:
 *  - on mount: loads the TOP 10 debts (GetTopDebts)
 *  - when a valid phrase (>= 3 chars) is set: loads GetFilteredDebts
 *  - when the phrase is cleared: resets to the TOP 10 list
 *  - a request-sequence guard guarantees that a slow, stale response can
 *    never overwrite the result of a newer request (race-condition safe)
 *  - in-flight requests are aborted when a new one starts
 *
 * @returns {{
 *   debts: Array,
 *   loading: boolean,
 *   error: string|null,
 *   search: (phrase: string) => void,
 *   reset: () => void,
 * }}
 */
export function useDebts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phrase, setPhrase] = useState('');

  // Monotonic counter: only the latest request may update the state.
  const requestSeq = useRef(0);
  const abortRef = useRef(null);

  const load = useCallback(async (nextPhrase) => {
    const seq = ++requestSeq.current;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = isPhraseValid(nextPhrase)
        ? await getFilteredDebts(nextPhrase.trim(), controller.signal)
        : await getTopDebts(controller.signal);

      if (seq !== requestSeq.current) {
        return; // a newer request has taken over
      }
      setDebts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return; // superseded by a newer request
      }
      if (seq !== requestSeq.current) {
        return;
      }
      setError(err && err.message ? err.message : 'Nieznany błąd');
      setDebts([]);
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  // Initial load: TOP 10.
  useEffect(() => {
    load('');
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [load]);

  const search = useCallback(
    (nextPhrase) => {
      const trimmed = String(nextPhrase || '').trim();
      setPhrase(trimmed);
      load(trimmed);
    },
    [load]
  );

  const reset = useCallback(() => {
    setPhrase('');
    load('');
  }, [load]);

  return { debts, loading, error, phrase, search, reset };
}
