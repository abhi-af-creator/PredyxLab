import Plot from "react-plotly.js";

export default function PriceChart({ data, priceType }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const dates = data.map(d => d.date);
  const traces = [];

  if (priceType === "open" || priceType === "both") {
    traces.push({
      x: dates,
      y: data.map(d => d.open),
      name: "Open",
      mode: "lines",
      line: { color: "#2563eb", width: 2 }
    });
  }

  if (priceType === "close" || priceType === "both") {
    traces.push({
      x: dates,
      y: data.map(d => d.close),
      name: "Close",
      mode: "lines",
      line: { color: "#dc2626", width: 2 }
    });
  }

  return (
    <Plot
      data={traces}
      layout={{
        autosize: true,
        margin: { l: 60, r: 20, t: 10, b: 70 },
        xaxis: {
          title: { text: "Date", font: { size: 14, style: "italic" } },
          tickangle: -30
        },
        yaxis: {
          title: { text: "Price", font: { size: 14, style: "italic" } }
        },
        legend: {
          orientation: "h",
          y: -0.35,
          x: 0.5,
          xanchor: "center"
        }
      }}
      config={{ displayModeBar: false, responsive: true }}
      useResizeHandler
      style={{ width: "100%", height: 320 }}
    />
  );
}
