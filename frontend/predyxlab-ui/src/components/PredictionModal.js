import "./PredictionModal.css";

/**
 * Get next business day after a given date
 */
const getNextBusinessDay = (date) => {
  const d = new Date(date);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6); // skip Sun/Sat
  return d;
};

/**
 * Generate future business dates starting AFTER last trading date
 */
const generateBusinessDates = (startDate, count) => {
  const dates = [];
  let d = getNextBusinessDay(startDate);

  while (dates.length < count) {
    dates.push(d.toISOString().slice(0, 10));
    d = getNextBusinessDay(d);
  }

  return dates;
};

export default function PredictionModal({ data, symbol, onClose }) {
  if (!data) return null;

  // ✅ Support both baseline & ML models
  const prices = data.predicted_prices || data.path || [];
  if (!Array.isArray(prices) || prices.length === 0) return null;

  // 🔑 CRITICAL FIX:
  // Use LAST KNOWN TRADING DATE, not "today"
  const lastTradingDate =
    data.last_date ||            // preferred (if backend sends it later)
    new Date().toISOString();    // safe fallback

  const dates = generateBusinessDates(lastTradingDate, prices.length);

  return (
    <div className="prediction-overlay">
      <div className="prediction-modal">
        <div className="prediction-header">
          <h3>
            Prediction ({data.horizon}) – {symbol}
          </h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="prediction-body">
          <p><b>Model:</b> {data.model}</p>
          <p><b>Last Close:</b> {data.last_close}</p>
          <p><b>Expected Price:</b> {data.expected_price}</p>
          <p><b>Expected Return (%):</b> {data.expected_return_pct}</p>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Predicted Price</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p, i) => (
                <tr key={i}>
                  <td>{dates[i]}</td>
                  <td>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
