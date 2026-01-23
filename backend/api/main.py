from fastapi import FastAPI, HTTPException
from src.data_fetch import fetch_historical_data

app = FastAPI(
    title="PredyxLab API",
    description="Modular stock prediction and analytics platform",
    version="0.1.0"
)

@app.get("/")
def health():
    return {"status": "PredyxLab backend running"}

@app.get("/historical")
def get_historical(symbol: str):
    data = fetch_historical_data(symbol)

    if data is None:
        raise HTTPException(status_code=404, detail="No data found for symbol")

    return data.to_dict(orient="records")
