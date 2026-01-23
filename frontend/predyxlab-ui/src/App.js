import { useState } from "react";
import Controls from "./components/Controls";
import PriceChart from "./components/PriceChart";

const PERIOD_MAP = {
  "1D": "day",
  "1W": "week",
  "1M": "month",
  "1Y": "year"
};

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("1Y");
  const [lastSymbol, setLastSymbol] = useState("RELIANCE.NS");

  const fetchData = async (symbol, _priceType, period) => {
    try {
      setLoading(true);
      setLastSymbol(symbol);

      const res = await fetch(
        `http://127.0.0.1:8000/historical?symbol=${symbol}&period=${period}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Backend not reachable or invalid response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, background: "#0f172a", minHeight: "100vh" }}>
      <h2 style={{ color: "#e5e7eb", marginBottom: 20 }}>PredyxLab</h2>

      <div
        style={{
          background: "#020617",
          padding: 20,
          borderRadius: 12
        }}
      >
        {/* Stock + options */}
        <Controls
          onFetch={(symbol, pt) =>
            fetchData(symbol, pt, PERIOD_MAP[timeframe])
          }
        />

        {/* Timeframe buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {["1D", "1W", "1M", "1Y"].map(tf => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                fetchData(lastSymbol, "both", PERIOD_MAP[tf]);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #334155",
                background: tf === timeframe ? "#2563eb" : "#020617",
                color: "#e5e7eb",
                cursor: "pointer"
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Status */}
        {loading && (
          <p style={{ color: "#94a3b8", marginTop: 16 }}>
            Loading data…
          </p>
        )}

        {!loading && data.length > 0 && (
          <>
            <p style={{ color: "#94a3b8", marginTop: 16 }}>
              Records fetched: {data.length}
            </p>
            <PriceChart data={data} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
