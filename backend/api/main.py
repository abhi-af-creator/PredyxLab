from typing import Optional
from unittest import result
from xxlimited import Str
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import logging
from pydantic import BaseModel, EmailStr
import os
import uuid
from datetime import datetime
#from azure.data.tables import TableServiceClient


# -------------------- APP --------------------
app = FastAPI(title="PredyxLab API", version="1.0")

# -------------------- LOGGING --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("predyxlab")

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- STARTUP VALIDATION --------------------

@app.on_event("startup")
def validate_startup():
    try:
        from backend.src.models import linear_predictor
        from backend.src.models import baseline_predictor
        from backend.src.models import momentum_predictor
        from backend.src.arbitration import model_selector
        logger.info("STARTUP CHECK PASSED: All core modules loaded")
    except Exception:
        logger.exception("STARTUP CHECK FAILED")
        raise RuntimeError("Critical modules missing at startup")


# -------------------- HELPERS --------------------
def normalize_symbol(symbol: str) -> str:
    symbol = symbol.upper().strip()
    if "." not in symbol:
        return f"{symbol}.NS"
    return symbol


def flatten_yfinance_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converts ANY yfinance DataFrame into:
    Date | Open | Close
    with guaranteed scalar values
    """
    df = df.reset_index()

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]

    required = ["Date", "Open", "Close"]
    df = df[[c for c in required if c in df.columns]]

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df["Open"] = pd.to_numeric(df["Open"], errors="coerce")
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")

    return df.dropna(subset=["Date", "Open", "Close"])

# -------------------- VISITOR LOGGING MODELS --------------------

class VisitorPayload(BaseModel):
    name: str
    email: str
    interest: Optional[str] = None
# -------------------- HISTORICAL --------------------
@app.get("/historical")
def get_historical(
    symbol: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    try:
        import yfinance as yf

        yf_symbol = normalize_symbol(symbol)
        logger.info(f"Fetching historical data: {yf_symbol}")

        df = yf.download(
            yf_symbol,
            start=start_date,
            end=end_date,
            interval="1d",
            auto_adjust=False,
            progress=False,
            group_by="column",
        )

        if df is None or df.empty:
            return []

        df = flatten_yfinance_df(df)

        return [
            {
                "date": d.strftime("%Y-%m-%d"),
                "open": round(float(o), 3),
                "close": round(float(c), 3),
            }
            for d, o, c in zip(df["Date"], df["Open"], df["Close"])
        ]

    except Exception as e:
        logger.exception("HISTORICAL ERROR")
        return {
            "error": "historical_failed",
            "reason": str(e),
        }

# -------------------- PREDICT --------------------
@app.get("/predict")
def predict(symbol: str, horizon: str = "7d"):
    try:
        from backend.src.data_fetch import fetch_historical_data
        from backend.src.arbitration.model_selector import select_best_model

        yf_symbol = normalize_symbol(symbol)
        horizon = horizon.lower().strip()

        if not horizon.endswith("d"):
            raise HTTPException(
                status_code=400,
                detail="Invalid horizon format. Use '7d', '14d', etc.",
            )
        if horizon not in {"7d", "14d", "30d"}:
            raise HTTPException(
                status_code=400,
                detail="Supported horizons: 7d, 14d, 30d"
            )

        logger.info(
            "Prediction request",
            extra={"symbol": yf_symbol, "horizon": horizon},
        )

        df = fetch_historical_data(yf_symbol)

        if df is None or df.empty:
            raise ValueError("No historical data available")

        result = select_best_model(df, horizon=horizon)
        last_date = df["Date"].iloc[-1].strftime("%Y-%m-%d")

        if "prediction" in result:
            result["prediction"]["last_date"] = last_date

        if not result or "prediction" not in result:
            return {
                "selected_model": "none",
                "prediction": {},
                "reason": "No model produced a valid prediction",
            }


        return result

    except Exception as e:
        logger.exception(
            "Prediction failed",
            extra={"symbol": symbol, "horizon": horizon}
        )
        return {
            "selected_model": "error",
            "prediction": {},
            "reason": str(e),
        }


# -------------------- VISITOR LOGGING --------------------

@app.post("/visitor-log")
async def visitor_log(payload: VisitorPayload, request: Request):
    try:
        conn_str = os.getenv("storageconnectionstring")
        logger.warning(f"ENV CHECK storageconnectionstring = {bool(conn_str)}")

        if not conn_str:
            logger.warning("Storage connection string not configured")
            return {"status": "skipped"}

        service = TableServiceClient.from_connection_string(conn_str)
        table = service.get_table_client("VisitorLogs")

        entity = {
            "PartitionKey": "gateway",
            "RowKey": str(uuid.uuid4()),
            "name": payload.name,
            "email": payload.email,
            "visited_at": datetime.utcnow().isoformat(),
            "user_agent": request.headers.get("user-agent", ""),
        }

        table.create_entity(entity)

        return {"status": "logged"}

    except Exception as e:
        # FAIL SILENTLY — do NOT break user flow
        logger.warning(f"Visitor logging failed: {e}")
        return {"status": "skipped"}



# -------------------- HEALTH --------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "predyxlab-api",
    }

@app.get("/ready")
def readiness():
    try:
        from backend.src.models.linear_predictor import predict_linear
        return {"ready": True}
    except Exception:
        return {"ready": False}
@app.get("/meta")
def meta():
    return {
        "service": "PredyxLab",
        "version": "2.0",
        "models": [
            "baseline_mean_return",
            "linear_regression",
            "momentum_trend"
        ],
        "default_horizon": "7d",
        "data_source": "Yahoo Finance",
        "deployment": "Azure Container Apps",
    }
@app.get("/smoke")
def smoke():
    try:
        from backend.src.models.linear_predictor import predict_linear
        return {"status": "ok", "model": "linear_regression"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
