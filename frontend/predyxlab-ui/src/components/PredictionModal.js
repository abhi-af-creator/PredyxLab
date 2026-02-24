import { useState } from "react";
import "./PredictionModal.css";

/* ---------- Generate Next Business Days ---------- */
const generateBusinessDates = (startDate, count) => {
  const dates = [];
  let d = new Date(startDate);

  while (dates.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();

    if (day !== 0 && day !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }

  return dates;
};

export default function PredictionModal({
  data,
  symbol,
  onClose,
  runAdvancedForecast
}) {
  const [loadingAI, setLoadingAI] = useState(false);

  if (!data) return null;

  const isAdvanced = data.advanced === true;

  /* ---------- NORMALIZE DATA ---------- */

  let rows = [];

  if (isAdvanced && Array.isArray(data.forecast)) {
    rows = data.forecast.map(item => ({
      date: item.date,
      predicted: item.predicted_close
    }));
  } else {
    const basePrices = data.predicted_prices || data.path || [];

    if (Array.isArray(basePrices) && basePrices.length > 0) {
      let dates = [];

      if (data.last_date) {
        dates = generateBusinessDates(
          data.last_date,
          basePrices.length
        );
      } else {
        dates = basePrices.map((_, i) => `Day ${i + 1}`);
      }

      rows = basePrices.map((price, index) => ({
        date: dates[index],
        predicted: price
      }));
    }
  }

  if (!rows.length) return null;

  const handleAI = async () => {
    if (!runAdvancedForecast) return;
    setLoadingAI(true);
    await runAdvancedForecast();
    setLoadingAI(false);
  };

  return (
    <div className="prediction-overlay">
      <div className="prediction-modal">

        {/* -------- HEADER -------- */}
        <div className="prediction-header">
          <h3>
            {isAdvanced
              ? `Advanced AI Forecast – ${symbol}`
              : `Prediction – ${symbol}`}
          </h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="prediction-body">

          {/* -------- SUMMARY -------- */}
          <div className="prediction-summary">

            {!isAdvanced && (
              <>
                <div className="summary-row split">
                  <div><b>Model:</b> {data.model}</div>
                  <div>
                    <b>Confidence:</b>{" "}
                    {(Number(data.confidence) * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="summary-row split">
                  <div>
                    <b>Expected Price:</b>{" "}
                    {Number(data.expected_price).toFixed(2)}
                  </div>
                  <div>
                    <b>Expected Return (%):</b>{" "}
                    {Number(data.expected_return_pct).toFixed(2)}
                  </div>
                </div>

                <div className="summary-row">
                  <div>
                    <b>Last Close:</b>{" "}
                    {Number(data.last_close).toFixed(2)}
                  </div>
                </div>
              </>
            )}

            {isAdvanced && (
              <div className="summary-row split">
                <div><b>Advanced AI Model:</b> {data.model}</div>
                <div>
                  <b>Confidence:</b>{" "}
                  {Number(data.confidence).toFixed(2)}%
                </div>
              </div>
            )}

          </div>

          {/* -------- TABLE -------- */}
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Predicted Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td>{Number(row.predicted).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* -------- AI BUTTON (ONLY FOR NORMAL MODE) -------- */}
          {!isAdvanced && (
            <div className="ai-button-wrapper">
              <button
                className="advanced-upgrade"
                onClick={handleAI}
                disabled={loadingAI}
              >
                {loadingAI
                  ? "Running Advanced AI Forecast..."
                  : "Run Advanced AI Forecast"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}