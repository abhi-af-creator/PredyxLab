from fastapi import FastAPI, HTTPException, Query
from src.data_fetch import fetch_historical_data

app = FastAPI(
    title="PredyxLab API",
    description="Modular stock prediction and analytics platform",
    version="0.2.0"
)

@app.get("/")
def health():
    return {"status": "PredyxLab backend running"}

@app.get("/historical")
def get_historical(
    symbol: str,
    price_type: str = Query("both", enum=["open", "close", "both"]),
    days: int = 365
):
    df = fetch_historical_data(symbol, days)

    if df is None:
        raise HTTPException(status_code=404, detail="No data found for symbol")

    base_cols = ["Date"]
    
    if price_type == "open":
        cols = base_cols + ["Open"]
    elif price_type == "close":
        cols = base_cols + ["Close"]
    else:
        cols = base_cols + ["Open", "Close"]

    return df[cols].to_dict(orient="records")
