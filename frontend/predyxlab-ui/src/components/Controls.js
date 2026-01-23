import { useState } from "react";

function Controls({ onFetch }) {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [priceType, setPriceType] = useState("both");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-03-31");

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <input
        value={symbol}
        onChange={e => setSymbol(e.target.value)}
        placeholder="Symbol"
      />

      <select
        value={priceType}
        onChange={e => setPriceType(e.target.value)}
      >
        <option value="both">Both</option>
        <option value="open">Open</option>
        <option value="close">Close</option>
      </select>

      <input
        type="date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
      />

      <input
        type="date"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
      />

      <button
        onClick={() =>
          onFetch(symbol, priceType, startDate, endDate)
        }
      >
        Fetch
      </button>
    </div>
  );
}

export default Controls;
