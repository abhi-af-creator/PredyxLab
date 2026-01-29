import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from backend.src.features.feature_builder import build_features, flatten_yfinance

FEATURE_COLS = [
    "ret_1",
    "ret_5",
    "ma_5_ratio",
    "ma_10_ratio",
    "vol_5",
    "momentum_5"
]

def predict_linear(df: pd.DataFrame, horizon: str = "7d"):
    """
    7-day linear regression predictor.
    Correctly separates RAW prices from feature-engineered data.
    """

    if df is None or df.empty:
        raise ValueError("Empty dataframe passed to predictor")

    # ✅ Preserve raw prices (CRITICAL)
    raw_df = df.copy()

    # Feature-safe dataframe
    df = flatten_yfinance(df)
    df_feat = build_features(df)

    if len(df_feat) < 300:
        raise ValueError("Not enough data for linear prediction")

    # ---- Train window (~2 years) ----
    train = df_feat.iloc[-504:]
    X = train[FEATURE_COLS].values
    y = train["target_7d"].values

    model = LinearRegression()
    model.fit(X, y)

    # ---- Latest features ----
    X_latest = df_feat[FEATURE_COLS].iloc[-1].to_numpy().reshape(1, -1)
    pred_return = float(model.predict(X_latest).item())

    # ✅ TRUE last traded price (RAW, not flattened)
    close_col = raw_df["Close"]
    last_close = float(
        close_col.iloc[-1] if isinstance(close_col, pd.Series)
        else close_col.iloc[-1, -1]
    )

    expected_price = last_close * (1 + pred_return)

    path = [
        round(last_close * (1 + pred_return * (i / 7)), 2)
        for i in range(1, 8)
    ]

    return {
        "horizon": "7d",
        "model": "linear_regression",
        "last_close": round(last_close, 2),
        "expected_price": round(expected_price, 2),
        "expected_return_pct": round(pred_return * 100, 2),
        "path": path
    }
