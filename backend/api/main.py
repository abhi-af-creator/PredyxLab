from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.src.data_fetch import fetch_historical_data
import pandas as pd

app = FastAPI(
    title="PredyxLab API",
    description="Stock analytics and prediction backend",
    version="1.0.0"
)

# --------------------
# CORS CONFIG
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# HEALTH CHECK
# --------------------
@app.get("/")
def health():
    return {"status": "PredyxLab backend running"}

# --------------------
# HISTORICAL DATA API
# --------------------
@app.get("/historical")
def get_historical(
    symbol: str,
    price_type: str = Query("both", enum=["open", "close", "both"]),
    start_date: str | None = None,
    end_date: str | None = None,
):
    # Fetch data (data_fetch.py already does reset_index)
    df = fetch_historical_data(symbol)

    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No data found")

    # --------------------
    # FLATTEN MULTIINDEX COLUMNS
    # --------------------
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [
            "_".join([str(c) for c in col if c]).strip()
            for col in df.columns
        ]
    else:
        df.columns = [str(c) for c in df.columns]

    # --------------------
    # IDENTIFY DATE COLUMN
    # --------------------
    date_col = None
    for col in df.columns:
        if col.lower() in ("date", "datetime", "index"):
            date_col = col
            break

    if not date_col:
        raise HTTPException(
            status_code=500,
            detail=f"Date column not found. Columns: {df.columns.tolist()}"
        )

    # Normalize date column
    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    df = df.dropna(subset=[date_col])

    # --------------------
    # APPLY DATE FILTERS
    # --------------------
    if start_date:
        df = df[df[date_col] >= pd.to_datetime(start_date)]

    if end_date:
        df = df[df[date_col] <= pd.to_datetime(end_date)]

    if df.empty:
        raise HTTPException(
            status_code=404,
            detail="No data found for selected symbol/date range"
        )

    # --------------------
    # IDENTIFY OPEN / CLOSE COLUMNS (DYNAMIC)
    # --------------------
    open_col = None
    close_col = None

    for col in df.columns:
        c = col.lower()
        if c.startswith("open"):
            open_col = col
        elif c.startswith("close"):
            close_col = col

    if not open_col or not close_col:
        raise HTTPException(
            status_code=500,
            detail=f"Open/Close columns not found. Columns: {df.columns.tolist()}"
        )

    # --------------------
    # BUILD JSON RESPONSE
    # --------------------
    result = []
    for _, row in df.iterrows():
        record = {
            "date": row[date_col].date().isoformat()
        }

        if price_type in ("open", "both"):
            record["open"] = float(row[open_col])

        if price_type in ("close", "both"):
            record["close"] = float(row[close_col])

        result.append(record)

    return result
