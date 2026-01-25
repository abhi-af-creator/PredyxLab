import { useState } from "react";

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
      <div className="row">
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          placeholder="Symbol"
        />

        <select
          value={priceType}
          onChange={e => setPriceType(e.target.value)}
        >
          <option value="both">Open + Close</option>
          <option value="open">Open</option>
          <option value="close">Close</option>
        </select>
      </div>

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
