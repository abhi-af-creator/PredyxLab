import Chart from "react-apexcharts";

function PriceChart({ data }) {
  if (!data || data.length === 0) return null;

  const dates = data.map(d => d.Date);
  const openPrices = data.map(d => d.Open ?? null);
  const closePrices = data.map(d => d.Close ?? null);

  const series = [
    {
      name: "Open",
      data: openPrices
    },
    {
      name: "Close",
      data: closePrices
    }
  ];

  const options = {
    chart: {
      type: "line",
      height: 350,
      zoom: { enabled: true },
      toolbar: { show: true },
      foreColor: "#cbd5f5"
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    xaxis: {
      categories: dates,
      labels: { rotate: -45 }
    },
    tooltip: {
      theme: "dark"
    },
    grid: {
      borderColor: "#334155"
    },
    legend: {
      position: "top"
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Chart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
}

export default PriceChart;
