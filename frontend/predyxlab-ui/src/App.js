import { useState } from "react";
import Controls from "./components/Controls";
import PriceChart from "./components/PriceChart";
import PredictionModal from "./components/PredictionModal";
import "./App.css";

/* ---------------- API BASE ---------------- */
const API_BASE =
  process.env.REACT_APP_API_BASE ;
if (!API_BASE) {
  console.error("❌ REACT_APP_API_BASE is undefined at build time");
}
/* ---------------- EMPTY CHART ---------------- */
const emptyChart = () => ({
  id: crypto.randomUUID?.() || Date.now().toString(),
  symbol: "RELIANCE",
  priceType: "both",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  data: [],
  loading: false
});

export default function App() {
  const [charts, setCharts] = useState([emptyChart()]);
  const [prediction, setPrediction] = useState(null);
  const [predSymbol, setPredSymbol] = useState(null);

  /* ---------------- FETCH HISTORICAL ---------------- */
  const fetchData = async (id, params) => {
    setCharts(cs =>
      cs.map(c => (c.id === id ? { ...c, loading: true } : c))
    );

    try {
      const query = new URLSearchParams({
        symbol: params.symbol,
        start_date: params.startDate,
        end_date: params.endDate
      }).toString();

      const res = await fetch(`${API_BASE}/historical?${query}`);
      const json = await res.json();

      setCharts(cs =>
        cs.map(c =>
          c.id === id
            ? {
                ...c,
                data: Array.isArray(json) ? json : [],
                priceType: params.priceType,
                symbol: params.symbol,
                loading: false
              }
            : c
        )
      );
    } catch (err) {
      console.error("Fetch error:", err);
      setCharts(cs =>
        cs.map(c =>
          c.id === id ? { ...c, data: [], loading: false } : c
        )
      );
    }
  };

  /* ---------------- PREDICT ---------------- */
  const predict = async symbol => {
    setPrediction(null);
    setPredSymbol(symbol);

    try {
      const res = await fetch(
        `${API_BASE}/predict?symbol=${symbol}&horizon=7d`
      );

      const json = await res.json();

      // unwrap arbitration payload
      const payload = json.prediction || json;
      const prices = payload?.path;

      if (!Array.isArray(prices) || prices.length === 0) {
        console.error("Invalid prediction payload:", json);
        alert("Prediction failed. No usable data returned.");
        return;
      }

      setPrediction(payload);

    } catch (err) {
      console.error("Prediction request failed:", err);
      alert("Prediction request failed");
    }
  };

  /* ---------------- CHART OPS ---------------- */
  const addChart = () => {
    if (charts.length >= 6) return;
    setCharts(cs => [...cs, emptyChart()]);
  };

  const removeChart = id => {
    if (charts.length === 1) return;
    setCharts(cs => cs.filter(c => c.id !== id));
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="app">
      <h2>PredyxLab</h2>

      <div className="chart-grid">
        {charts.map(chart => (
          <div key={chart.id} className="chart-card">
            {/* Remove chart */}
            <button
              className="remove-chart"
              onClick={() => removeChart(chart.id)}
              title="Remove chart"
            >
              ✕
            </button>

            <Controls
              initial={chart}
              onFetch={params => fetchData(chart.id, params)}
              onPredict={() => predict(chart.symbol)}
              canPredict={chart.data.length > 0}
            />

            {chart.loading && <p className="status">Loading…</p>}
            {!chart.loading && chart.data.length === 0 && (
              <p className="status">No data loaded</p>
            )}

            <PriceChart
              data={chart.data}
              priceType={chart.priceType}
            />
          </div>
        ))}

        {/* Add more charts */}
        {charts.length < 6 && (
          <div className="more-charts" onClick={addChart}>
            <div>
              <span>＋</span>
              <p>More Charts</p>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- PREDICTION MODAL ---------------- */}
      {prediction && (
        <PredictionModal
          data={prediction}
          symbol={predSymbol}
          onClose={() => setPrediction(null)}
        />
      )}
    </div>
  );
}
// force rebuild 02/01/2026 01:15:37
