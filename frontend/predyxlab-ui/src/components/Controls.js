import React, { useState } from "react";

function Controls({ onFetch }) {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [priceType, setPriceType] = useState("both");
  const [period, setPeriod] = useState("year");

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Stock Symbol"
      />

      <select value={priceType} onChange={(e) => setPriceType(e.target.value)}>
        <option value="both">Both</option>
        <option value="open">Open</option>
        <option value="close">Close</option>
      </select>

      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="day">Daily</option>
        <option value="week">Weekly</option>
        <option value="year">Yearly</option>
      </select>

      <button onClick={() => onFetch(symbol, priceType, period)}>
        Fetch
      </button>
    </div>
  );
}

export default Controls;
