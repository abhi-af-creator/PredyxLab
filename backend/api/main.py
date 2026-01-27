from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np

app = FastAPI()

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- HELPERS --------------------
def normalize_symbol(symbol: str) -> str:
    symbol = symbol.upper().strip()
    if "." not in symbol:
        return f"{symbol}.NS"
    return symbol


def flatten_yfinance_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converts ANY yfinance DataFrame into:
    Date | Open | Close
    with guaranteed scalar values
    """
    # Reset index to expose Date
    df = df.reset_index()

    # Handle MultiIndex columns safely
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [
            col[0] if isinstance(col, tuple) else col
            for col in df.columns
        ]

    # Keep only what we need
    required = ["Date", "Open", "Close"]
    df = df[[c for c in required if c in df.columns]]

    # Enforce types
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df["Open"] = pd.to_numeric(df["Open"], errors="coerce")
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")

    # Drop bad rows
    df = df.dropna(subset=["Date", "Open", "Close"])

    return df


# -------------------- HISTORICAL --------------------
@app.get("/historical")
def get_historical(
    symbol: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...)
):
    try:
        yf_symbol = normalize_symbol(symbol)

        df = yf.download(
            yf_symbol,
            start=start_date,
            end=end_date,
            interval="1d",
            auto_adjust=False,
            progress=False,
            group_by="column"
        )

        if df is None or df.empty:
            return []

        df = flatten_yfinance_df(df)

        if df.empty:
            return []

        # Convert to JSON-safe structure
        return [
            {
                "date": d.strftime("%Y-%m-%d"),
                "open": round(float(o), 3),
                "close": round(float(c), 3),
            }
            for d, o, c in zip(df["Date"], df["Open"], df["Close"])
        ]

    except Exception as e:
        print("HISTORICAL ERROR:", repr(e))
        return []


# -------------------- PREDICT --------------------
@app.get("/predict")
def predict(symbol: str, start_date: str, end_date: str, horizon: str = "7d"):
    try:
        from src.data_fetch import fetch_historical_data
        from src.arbitration.model_selector import select_best_model

        yf_symbol = normalize_symbol(symbol)
        df = fetch_historical_data(yf_symbol)

        if df is None or df.empty:
            raise ValueError("No historical data")

        result = select_best_model(df)
        return result

    except Exception as e:
        print("PREDICT ERROR:", repr(e))
        return {}
