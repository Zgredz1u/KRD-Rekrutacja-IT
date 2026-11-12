import { useState } from 'react';
import { isPhraseValid } from '../api/debts';
import './SearchForm.less';

/**
 * Search form: label + text input + "SZUKAJ" button.
 *
 * - phrases shorter than 3 characters are not sent to the API
 *   (the API would answer HTTP 405); the button is disabled instead
 * - an empty phrase resets the table to the TOP 10 list
 * - the button is disabled while a request is in flight
 */
export default function SearchForm({ onSearch, loading }) {
  const [value, setValue] = useState('');

  const canSubmit = !loading && (value.trim() === '' || isPhraseValid(value));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSearch(value);
  };

  return (
    <form className="search" onSubmit={handleSubmit} role="search">
      <label className="search__label" htmlFor="search-phrase">
        PODAJ NIP LUB NAZWĘ DŁUŻNIKA
      </label>
      <div className="search__row">
        <input
          id="search-phrase"
          className="search__input"
          type="text"
          name="phrase"
          placeholder="NIP lub nazwa dłużnika"
          autoComplete="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={loading}
        />
        <button
          className="search__button"
          type="submit"
          disabled={!canSubmit}
          title={
            value.trim() !== '' && !isPhraseValid(value)
              ? 'Fraza musi mieć co najmniej 3 znaki'
              : undefined
          }
        >
          SZUKAJ
        </button>
      </div>
    </form>
  );
}
