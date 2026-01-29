import numpy as np
import pandas as pd

def predict_momentum(df: pd.DataFrame, horizon: str = "7d"):
    """
    Momentum-based predictor using recent trend + volatility dampening.
    GUARANTEED schema compatibility.
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
        "1m": 21
    }

    if horizon not in horizon_map:
        raise ValueError("Invalid horizon")

    h = horizon_map[horizon]

    if len(close) < 60:
        raise ValueError("Not enough data for momentum model")

    # --- Trend estimation (last 30 days) ---
    y = close.iloc[-30:].values
    x = np.arange(len(y))

    slope = np.polyfit(x, y, 1)[0]  # daily price slope

    # --- Volatility dampening ---
    daily_returns = close.pct_change().dropna()
    vol = daily_returns.tail(30).std()

    adjusted_return = (slope / close.iloc[-1]) * h
    adjusted_return = adjusted_return * (1 - min(vol * 5, 0.7))

    last_close = float(close.iloc[-1])
    expected_price = last_close * (1 + adjusted_return)

    # --- Build path ---
    path = [
        round(last_close * (1 + adjusted_return * (i / h)), 2)
        for i in range(1, h + 1)
    ]

    return {
        "horizon": horizon,
        "model": "momentum_trend",
        "last_close": round(last_close, 2),
        "expected_price": round(expected_price, 2),
        "expected_return_pct": round(adjusted_return * 100, 2),
        "path": path
    }
