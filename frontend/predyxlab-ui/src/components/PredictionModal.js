import "./PredictionModal.css";

export default function PredictionModal({ data, symbol, onClose }) {
  if (!data || !Array.isArray(data.predicted_prices)) return null;

  // Generate future dates (business days)
  const start = new Date();
  const dates = [];
  let d = new Date(start);

  while (dates.length < data.predicted_prices.length) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }

  return (
    <div className="prediction-overlay">
      <div className="prediction-modal">
        <div className="prediction-header">
          <h3>Prediction ({data.horizon}) – {symbol}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="prediction-body">
          <p><b>Last Close:</b> {data.last_close}</p>
          <p><b>Mean Daily Return:</b> {data.mean_daily_return}</p>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Predicted Price</th>
              </tr>
            </thead>
            <tbody>
              {data.predicted_prices.map((p, i) => (
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
