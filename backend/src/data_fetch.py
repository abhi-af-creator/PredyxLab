import yfinance as yf

def fetch_historical_data(symbol, days=None):
    if not symbol:
        return None

    symbol = symbol.strip().upper()  # ✅ CRITICAL FIX

    if days:
        df = yf.download(symbol, period=f"{days}d")
    else:
        df = yf.download(symbol, period="max")

    if df is None or df.empty:
        return None

    return df.reset_index()
