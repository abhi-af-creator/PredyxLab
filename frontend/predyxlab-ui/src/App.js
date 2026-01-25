import { useState } from "react";
import Controls from "./components/Controls";
import PriceChart from "./components/PriceChart";
import PredictionModal from "./components/PredictionModal";
import "./App.css";

const emptyChart = () => ({
  id: crypto.randomUUID(),
  symbol: "RELIANCE",
  priceType: "both",
  startDate: "2025-01-01",
  endDate: "2025-03-31",
  data: [],
  loading: false
});

export default function App() {
  const [charts, setCharts] = useState([emptyChart()]);
  const [prediction, setPrediction] = useState(null);
  const [predSymbol, setPredSymbol] = useState(null);

  /* ---------------- FETCH ---------------- */
  const fetchData = async (id, params) => {
    setCharts(cs =>
      cs.map(c => (c.id === id ? { ...c, loading: true } : c))
    );

    const query = new URLSearchParams({
      symbol: params.symbol,
      start_date: params.startDate,
      end_date: params.endDate
    });

    const res = await fetch(`http://127.0.0.1:8000/historical?${query}`);
    const json = await res.json();

    setCharts(cs =>
      cs.map(c =>
        c.id === id
          ? {
              ...c,
              data: json,
              priceType: params.priceType,
              symbol: params.symbol,
              loading: false
            }
          : c
      )
    );
  };

  /* ---------------- PREDICT ---------------- */
  const predict = async symbol => {
    setPrediction(null);
    setPredSymbol(symbol);

    const res = await fetch(
      `http://127.0.0.1:8000/predict?symbol=${symbol}&horizon=7d`
    );
    const json = await res.json();
    setPrediction(json);
  };

  /* ---------------- CHART OPS ---------------- */
  const addChart = () => {
    /*if (charts.length >= 6) return;*/
    setCharts(cs => [...cs, emptyChart()]);
  };

  const removeChart = id => {
    if (charts.length === 1) return;
    setCharts(cs => cs.filter(c => c.id !== id));
  };

  /* ---------------- LAYOUT CLASS ---------------- */
  const gridClass =
    charts.length === 1
      ? "cols-1"
      : charts.length === 2
      ? "cols-2"
      : "cols-3";

  return (
    <div className="app">
      <h2>PredyxLab</h2>

      <div className={`chart-grid ${gridClass}`}>
        {charts.map(chart => (
          <div key={chart.id} className="chart-card">
            {/* REMOVE BUTTON (always present) */}
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

        {/* MORE CHARTS PANEL — ALWAYS RENDERED */}
        <div className="more-charts" onClick={addChart}>
          <div>
            <span>＋</span>
            <p>More Charts</p>
          </div>
        </div>
      </div>

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
