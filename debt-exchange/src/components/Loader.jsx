import './Loader.less';

/**
 * Loading indicator shown while an API request is in flight
 * (GetFilteredDebts has a built-in random delay, so the loader is
 * required by the task).
 */
export default function Loader({ label = 'Ładowanie danych…' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
}
