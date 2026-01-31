import { useState } from "react";
import { NSE_SYMBOLS } from "../constants/symbols";
const todayISO = () =>
  new Date().toISOString().split("T")[0];
export default function Controls({
  initial,
  onFetch,
  onPredict,
  canPredict
}) {
  const [symbol, setSymbol] = useState(initial.symbol);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [priceType, setPriceType] = useState(initial.priceType);

  return (
    <div className="controls">
      {/* SYMBOL + PRICE TYPE */}
      <div className="row">
        <input
          list="symbol-list"
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          placeholder="Select or type NSE symbol (e.g. RELIANCE)"
        />

        <datalist id="symbol-list">
          {NSE_SYMBOLS.map(sym => (
            <option key={sym} value={sym} />
          ))}
        </datalist>

        <select
          value={priceType}
          onChange={e => setPriceType(e.target.value)}
        >
          <option value="both">Open + Close</option>
          <option value="open">Open</option>
          <option value="close">Close</option>
        </select>
      </div>

      {/* DATE RANGE */}
      <div className="row">
        <input
          type="date"
          value={startDate}
          min="2011-01-01"
          max={endDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          min={startDate}
          max={todayISO()}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="row actions">
        <button
          className="btn fetch"
          onClick={() => {
            if (startDate > endDate) {
              alert("Start date cannot be after end date");
              return;
            }
            onFetch({ symbol, startDate, endDate, priceType });
          }}
        >
          Fetch
        </button>

        <button
          className={`btn predict ${canPredict ? "enabled" : ""}`}
          disabled={!canPredict}
          onClick={onPredict}
        >
          Predict
        </button>
      </div>
    </div>
  );
}
