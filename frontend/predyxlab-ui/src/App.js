import { useState } from "react";
import Controls from "./components/Controls";
import PriceChart from "./components/PriceChart";

function App() {
  const [rows, setRows] = useState([
    [
      {
        id: crypto.randomUUID(),
        data: [],
        priceType: "both"
      }
    ]
  ]);

  const fetchData = async (id, symbol, priceType, start, end) => {
    try {
      const url = `http://127.0.0.1:8000/historical?symbol=${symbol}&price_type=${priceType}&start_date=${start}&end_date=${end}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json();

      setRows(prev =>
        prev.map(row =>
          row.map(c =>
            c.id === id ? { ...c, data: json, priceType } : c
          )
        )
      );
    } catch {
      alert("Backend not reachable or invalid response");
    }
  };

  const addChart = () => {
    setRows(prev => {
      const newChart = {
        id: crypto.randomUUID(),
        data: [],
        priceType: "both"
      };

      const lastRow = prev[prev.length - 1];

      if (lastRow.length === 1) {
        // fill the row
        return [
          ...prev.slice(0, -1),
          [...lastRow, newChart]
        ];
      }

      // start new row
      return [...prev, [newChart]];
    });
  };

  const removeChart = id => {
    setRows(prev =>
      prev
        .map(row => row.filter(c => c.id !== id))
        .filter(row => row.length > 0)
    );
  };

  return (
    <div style={{ padding: 30, background: "#0f172a", minHeight: "100vh" }}>
      <h2 style={{ color: "#e5e7eb" }}>PredyxLab</h2>

      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 20
          }}
        >
          {row.map((chart, idx) => {
            const isLastChart =
              rowIdx === rows.length - 1 &&
              idx === row.length - 1;

            return (
              <div
                key={chart.id}
                style={{
                  flex: 1,
                  background: "#020617",
                  padding: 16,
                  borderRadius: 12
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10
                  }}
                >
                  <Controls
                    onFetch={(symbol, pt, start, end) =>
                      fetchData(chart.id, symbol, pt, start, end)
                    }
                  />

                  <div>
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeChart(chart.id)}
                        style={{
                          marginRight: 8,
                          background: "#7f1d1d",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 6
                        }}
                      >
                        ✕
                      </button>
                    )}

                    {isLastChart && (
                      <button
                        onClick={addChart}
                        style={{
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {chart.data.length > 0 ? (
                  <PriceChart
                    data={chart.data}
                    priceType={chart.priceType}
                  />
                ) : (
                  <p style={{ color: "#64748b" }}>No data loaded</p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default App;
