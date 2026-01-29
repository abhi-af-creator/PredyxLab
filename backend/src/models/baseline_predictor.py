import numpy as np
import pandas as pd

def predict_baseline(df: pd.DataFrame, horizon: str = "7d"):
    """
    Simple baseline using historical mean return.
    GUARANTEED to return production-safe schema.
    """

    if df is None or df.empty:
        raise ValueError("Input dataframe is empty")

    # --- HARD FLATTEN ---
    df = df.copy()
    df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]

    if "Close" not in df.columns:
        raise ValueError("Missing Close column")

    close = pd.to_numeric(df["Close"], errors="coerce").dropna()

    horizon_map = {
        "7d": 7,
        "1m": 21,
        "3m": 63
    }

    if horizon not in horizon_map:
        raise ValueError("Invalid horizon")

    h = horizon_map[horizon]

    returns = close.pct_change().dropna()

    mean_return = float(returns.mean() * h)
    last_close = float(close.iloc[-1])
    expected_price = last_close * (1 + mean_return)

    # Smooth path
    path = [
        round(last_close * (1 + mean_return * (i / h)), 2)
        for i in range(1, h + 1)
    ]

    return {
        "horizon": horizon,
        "model": "baseline_mean_return",
        "last_close": round(last_close, 2),
        "expected_price": round(expected_price, 2),
        "expected_return_pct": round(mean_return * 100, 2),
        "path": path
    }
