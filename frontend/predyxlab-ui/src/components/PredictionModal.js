import "./PredictionModal.css";

/**
 * Generate future business dates (Mon–Fri only)
 */
const generateBusinessDates = (count) => {
  const dates = [];
  let d = new Date();

  while (dates.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay(); // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }
  return dates;
};

export default function PredictionModal({ data, symbol, onClose }) {
  if (!data) return null;

  // ✅ Support both baseline & ML models
  const prices = data.predicted_prices || data.path || [];

  if (!Array.isArray(prices) || prices.length === 0) return null;

  // ✅ Generate business-day dates only
  const dates = generateBusinessDates(prices.length);

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
