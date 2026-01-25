import pandas as pd
import numpy as np


def flatten_yfinance(df: pd.DataFrame) -> pd.DataFrame:
    """
    Flattens yfinance MultiIndex columns safely.
    Converts ('Close','RELIANCE.NS') → 'Close'
    """
    if isinstance(df.columns, pd.MultiIndex):
        df = df.copy()
        df.columns = [c[0] for c in df.columns]
    return df


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Robust feature builder.
    GUARANTEED:
    - No MultiIndex leakage
    - No DataFrame assigned to a column
    - Only pure Series math
    """

    if df is None or df.empty:
        raise ValueError("Empty dataframe passed to feature builder")

    df = flatten_yfinance(df)

    required = {"Close", "Volume"}
    if not required.issubset(df.columns):
        raise ValueError(f"Missing required columns: {required - set(df.columns)}")

    out = pd.DataFrame(index=df.index)

    # ---- Base series (FORCED SERIES) ----
    close = pd.to_numeric(df["Close"], errors="coerce")
    volume = pd.to_numeric(df["Volume"], errors="coerce")

    out["Close"] = close
    out["Volume"] = volume

    # ---- Returns ----
    out["ret_1"] = close.pct_change()
    out["ret_5"] = close.pct_change(5)

    # ---- Moving averages ----
    ma_5 = close.rolling(5).mean()
    ma_10 = close.rolling(10).mean()

    out["ma_5_ratio"] = (close / ma_5) - 1
    out["ma_10_ratio"] = (close / ma_10) - 1

    # ---- Volatility ----
    out["vol_5"] = out["ret_1"].rolling(5).std()

    # ---- Momentum ----
    out["momentum_5"] = close - close.shift(5)

    # ---- Target ----
    out["target_7d"] = close.shift(-7) / close - 1

    return out.dropna()
