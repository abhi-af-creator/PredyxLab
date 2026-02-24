import { useState } from "react";
import Controls from "./components/Controls";
import PriceChart from "./components/PriceChart";
import PredictionModal from "./components/PredictionModal";
import AppHeader from "./components/AppHeader";
import "./App.css";

/* ---------------- API BASE ---------------- */
const API_BASE = process.env.REACT_APP_API_BASE;

const todayISO = () =>
  new Date().toISOString().split("T")[0];

const MIN_DATE = "2026-01-01";

/* ---------------- EMPTY CHART ---------------- */
const emptyChart = () => {
  const today = todayISO();

  return {
    id: crypto.randomUUID?.() || Date.now().toString(),
    symbol: "RELIANCE",
    priceType: "both",
    startDate: MIN_DATE,
    endDate: today,
    data: [],
    loading: false
  };
};

export default function App() {
  const [charts, setCharts] = useState([emptyChart()]);
  const [prediction, setPrediction] = useState(null);
  const [predSymbol, setPredSymbol] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  /* ---------------- CHART OPERATIONS ---------------- */
  const addChart = () => {
    if (charts.length >= 6) return;
    setCharts(prev => [...prev, emptyChart()]);
  };

  const removeChart = (id) => {
    if (charts.length === 1) return;
    setCharts(prev => prev.filter(c => c.id !== id));
  };

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
          c.id === id ? { ...c, loading: false } : c
        )
      );
    }
  };

  /* ---------------- BASIC PREDICT ---------------- */
  const predict = async symbol => {
  setPrediction(null);
  setPredSymbol(symbol);

  try {
    const res = await fetch(
      `${API_BASE}/predict?symbol=${symbol}&horizon=7d`
    );

    const json = await res.json();

    const basePrediction = json.prediction || json;

    const prices = basePrediction?.path;

    if (!Array.isArray(prices) || prices.length === 0) {
      alert("Prediction failed.");
      return;
    }

    const enhancedPrediction = {
      ...basePrediction,
      model: json.selected_model || basePrediction.model,
      confidence: json.confidence ?? null,
      last_date:
        basePrediction.last_date || json.last_date || null
    };

    setPrediction(enhancedPrediction);

  } catch (err) {
    console.error("Prediction request failed:", err);
    alert("Prediction request failed");
  }
};
  /* ---------------- ADVANCED PREDICT ---------------- */
  const predictAdvanced = async (symbol) => {
    setPrediction(null);
    setPredSymbol(symbol);
    setAiLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/predict-advanced?symbol=${symbol}&horizon=7d`
      );

      const json = await res.json();

      if (!json.forecast || json.forecast.length === 0) {
        alert("Advanced forecast failed.");
        setAiLoading(false);
        return;
      }

      setPrediction({
        model: json.selected_model,
        advanced: true,
        forecast: json.forecast,
        confidence: json.confidence ?? null
      });

    } catch (err) {
      console.error("Advanced prediction failed:", err);
      alert("Advanced prediction failed");
    }

    setAiLoading(false);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="app">
      <AppHeader />
      <h2>PredyxLab</h2>

      <div className="chart-grid">
        {charts.map(chart => (
          <div key={chart.id} className="chart-card">

            {/* Remove Chart Button */}
            <button
              className="remove-chart"
              onClick={() => removeChart(chart.id)}
            >
              ✕
            </button>

            <Controls
              initial={chart}
              onFetch={params => fetchData(chart.id, params)}
              onPredict={() => predict(chart.symbol)}
              onAdvancedPredict={() => predictAdvanced(chart.symbol)}
              canPredict={chart.data.length > 0 && !aiLoading}
            />

            {chart.loading && <p className="status">Loading...</p>}

            <PriceChart
              data={chart.data}
              priceType={chart.priceType}
            />
          </div>
        ))}

        {/* Add Chart Button */}
        {charts.length < 6 && (
          <div className="more-charts" onClick={addChart}>
            <div>
              <span style={{ fontSize: "32px" }}>＋</span>
              <p>Add Chart</p>
            </div>
          </div>
        )}
      </div>

      {prediction && (
        <PredictionModal
          data={prediction}
          symbol={predSymbol}
          onClose={() => setPrediction(null)}
          runAdvancedForecast={() => predictAdvanced(predSymbol)}
        />
      )}
    </div>
  );
}