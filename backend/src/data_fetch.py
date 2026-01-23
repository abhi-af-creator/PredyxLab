import yfinance as yf
from datetime import date, timedelta

def fetch_historical_data(symbol: str, days: int = 365):
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    df = yf.download(symbol, start=start_date, end=end_date, progress=False)

    if df.empty:
        return None

    # Flatten multi-index columns (yfinance quirk)
    if hasattr(df.columns, "levels"):
        df.columns = df.columns.get_level_values(0)

    df.reset_index(inplace=True)

    df["Date"] = df["Date"].astype(str)
    df = df.fillna(0)

    return df
