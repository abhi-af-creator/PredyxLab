import Chart from "react-apexcharts";

function PriceChart({ data }) {
  if (!data || data.length === 0) return null;

  const series = [
    {
      name: "Open",
      data: data.map(d => ({
        x: new Date(d.date),
        y: d.open
      }))
    },
    {
      name: "Close",
      data: data.map(d => ({
        x: new Date(d.date),
        y: d.close
      }))
    }
  ];

  const options = {
    chart: {
      type: "line",
      height: 350,
      zoom: { enabled: true },
      toolbar: { show: true }
    },
    xaxis: {
      type: "datetime"
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    markers: {
      size: 0
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy"
      }
    },
    colors: ["#22c55e", "#3b82f6"],
    grid: {
      borderColor: "#334155"
    }
  };

  return <Chart options={options} series={series} type="line" height={350} />;
}

export default PriceChart;
