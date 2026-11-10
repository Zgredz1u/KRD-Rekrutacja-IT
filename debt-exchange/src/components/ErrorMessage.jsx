import './ErrorMessage.less';

/**
 * Error banner with a retry action.
 *
 * @param {string} message - error message to display
 * @param {() => void} onRetry - called when the user clicks "SPRÓBUJ PONOWNIE"
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error" role="alert">
      <p className="error__message">{message}</p>
      <button type="button" className="error__retry" onClick={onRetry}>
        SPRÓBUJ PONOWNIE
      </button>
    </div>
  );
}
