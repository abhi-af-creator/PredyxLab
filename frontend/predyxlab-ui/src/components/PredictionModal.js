import "./PredictionModal.css";

/**
 * Get next business day after given date
 */
const nextBusinessDay = (dateStr) => {
  const d = new Date(dateStr);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6); // Skip Sun/Sat
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

  let prices = [];
  let dates = [];

  // -----------------------------
  // ADVANCED AI FORMAT
  // -----------------------------
  if (Array.isArray(data.forecast)) {
    prices = data.forecast.map(item => item.predicted_close);
    dates = data.forecast.map(item => item.date);
  }

  // -----------------------------
  // BASIC PREDICT FORMAT
  // -----------------------------
  else if (Array.isArray(data.predicted_prices || data.path)) {
    prices = data.predicted_prices || data.path;

    if (data.last_date) {
      dates = generateTradingDates(
        data.last_date,
        prices.length
      );
    }
  }

  if (!Array.isArray(prices) || prices.length === 0) return null;

  // -----------------------------
  // Confidence Handling
  // -----------------------------
  const confidencePct =
    typeof data.confidence === "number"
      ? data.confidence.toFixed(1)
      : null;

  return (
    <div className="prediction-overlay">
      <div className="prediction-modal">
        <div className="prediction-header">
          <h3>
            Prediction – {symbol}
          </h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="prediction-body">

          {/* Model */}
          {(data.model || data.selected_model) && (
            <p>
              <b>Model:</b> {data.model || data.selected_model}
            </p>
          )}

          {/* Existing fields (only show if available) */}
          {data.last_close && (
            <p><b>Last Close:</b> {data.last_close}</p>
          )}

          {data.expected_price && (
            <p><b>Expected Price:</b> {data.expected_price}</p>
          )}

          {data.expected_return_pct && (
            <p><b>Expected Return (%):</b> {data.expected_return_pct}</p>
          )}

          {/* Signal */}
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

          {/* Confidence */}
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

          {/* Prediction Table */}
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
                  <td>{dates[i] || "-"}</td>
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
