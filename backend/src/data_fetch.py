import yfinance as yf
import pandas as pd

def fetch_historical_data(symbol: str) -> pd.DataFrame:
    df = yf.download(
        symbol,
        period="2y",
        interval="1d",
        group_by="column",   # 🔥 IMPORTANT
        auto_adjust=False,
        progress=False
    )

    if df is None or df.empty:
        return pd.DataFrame()

    df = df.reset_index()
    return df
