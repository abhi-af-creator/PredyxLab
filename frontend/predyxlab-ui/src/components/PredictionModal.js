import "./PredictionModal.css";

/**
 * Get next business day after given date
 */
const nextBusinessDay = (dateStr) => {
  const d = new Date(dateStr);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6); // Sun/Sat
  return d;
};

/**
 * Generate future trading dates (Mon–Fri only)
 */
const generateTradingDates = (lastTradingDate, count) => {
  const dates = [];
  let d = nextBusinessDay(lastTradingDate);

  while (dates.length < count) {
    dates.push(d.toISOString().slice(0, 10));
    d = nextBusinessDay(d.toISOString());
  }

  return dates;
};

export default function PredictionModal({ data, symbol, onClose }) {
  if (!data) return null;

  const prices = data.predicted_prices || data.path || [];
  if (!Array.isArray(prices) || prices.length === 0) return null;

  if (!data.last_date) {
    console.error("Missing last_date from backend");
    return null;
  }

  const dates = generateTradingDates(
    data.last_date,
    prices.length
  );

  // Safe formatting
  const confidencePct =
    typeof data.confidence === "number"
      ? (data.confidence * 100).toFixed(1)
      : null;

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

          {/* ---------------- NEW FIELDS ---------------- */}

          {data.signal && (
            <p>
              <b>Signal:</b>{" "}
              <span
                style={{
                  color:
                    data.signal === "bullish"
                      ? "green"
                      : data.signal === "bearish"
                      ? "red"
                      : "gray"
                }}
              >
                {data.signal.toUpperCase()}
              </span>
            </p>
          )}

          {confidencePct && (
            <p>
              <b>Confidence:</b> {confidencePct}%
            </p>
          )}

          {data.alignment && (
            <p>
              <b>Model Alignment:</b> {data.alignment}
            </p>
          )}

          {/* ---------------- TABLE ---------------- */}

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
