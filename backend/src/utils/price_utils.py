import pandas as pd

def get_close_series(df: pd.DataFrame) -> pd.Series:
    """
    ALWAYS returns a pandas Series for Close prices.
    Works with yfinance MultiIndex and flat DataFrames.
    """
    if "Close" not in df.columns:
        raise ValueError("Close column missing")

    close = df["Close"]

    if isinstance(close, pd.DataFrame):
        # yfinance MultiIndex → take actual price column
        close = close.iloc[:, -1]

    return pd.to_numeric(close, errors="coerce").dropna()
