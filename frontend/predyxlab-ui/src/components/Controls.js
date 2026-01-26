import { useState } from "react";
import { NSE_SYMBOLS } from "../constants/symbols";

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
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="row actions">
        <button
          className="btn fetch"
          onClick={() =>
            onFetch({ symbol, startDate, endDate, priceType })
          }
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
