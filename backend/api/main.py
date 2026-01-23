from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.src.data_fetch import fetch_historical_data

app = FastAPI(
    title="PredyxLab API",
    description="Stock analytics and prediction backend",
    version="1.0.0"
)

# ✅ Correct CORS (NO wildcard + credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "PredyxLab backend running"}

@app.get("/historical")
def get_historical(
    symbol: str,
    price_type: str = Query("both", enum=["open", "close", "both"]),
    period: str = Query("year", enum=["day", "week", "year"])
):
    period_days = {
        "day": 30,
        "week": 180,
        "month": 365,
        "year": 365
    }

    days = period_days.get(period, 365)
    df = fetch_historical_data(symbol, days)

    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No data found")

    base_cols = ["Date"]
    if price_type == "open":
        cols = base_cols + ["Open"]
    elif price_type == "close":
        cols = base_cols + ["Close"]
    else:
        cols = base_cols + ["Open", "Close"]

    return df[cols].to_dict(orient="records")
