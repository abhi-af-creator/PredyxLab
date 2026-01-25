import "./PredictionModal.css";

export default function PredictionModal({ data, symbol, onClose }) {
  if (!data) return null;

  // ✅ Support both baseline & ML models
  const prices =
    data.predicted_prices || data.path || [];

  if (!Array.isArray(prices) || prices.length === 0) return null;

  // Generate future dates (business days)
  const dates = [];
  let d = new Date();

  while (dates.length < prices.length) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }

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
