import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from backend.src.features.feature_builder import build_features

FEATURE_COLS = [
    "ret_1",
    "ret_5",
    "ma_5_ratio",
    "ma_10_ratio",
    "vol_5",
    "momentum_5"
]

def predict_ridge(df: pd.DataFrame, alpha: float = 1.0):
    """
    7-day price prediction using Ridge Regression
    """

    if df is None or df.empty:
        raise ValueError("Empty dataframe passed to ridge predictor")

    df_feat = build_features(df)

    if len(df_feat) < 300:
        raise ValueError("Not enough data for ridge prediction")

    # Training window (2 years)
    df_train = df_feat.iloc[-504:]

    X = df_train[FEATURE_COLS].values
    y = df_train["target_7d"].values

    model = Ridge(alpha=alpha)
    model.fit(X, y)

    X_latest = df_feat[FEATURE_COLS].iloc[-1].values.reshape(1, -1)

    pred_return = float(model.predict(X_latest)[0])
    last_close = float(df_feat["Close"].iloc[-1])

    expected_price = last_close * (1 + pred_return)

    # Smooth 7-day path
    path = []
    for i in range(1, 8):
        step_price = last_close * (1 + pred_return * (i / 7))
        path.append(round(float(step_price), 2))

    return {
        "horizon": "7d",
        "model": "ridge_regression",
        "last_close": round(last_close, 2),
        "expected_price": round(expected_price, 2),
        "expected_return_pct": round(pred_return * 100, 2),
        "path": path
    }
