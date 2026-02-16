import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from backend.src.features.feature_builder import build_features


FEATURE_COLS = [
    "ret_1",
    "ret_5",
    "ma_5_ratio",
    "ma_10_ratio",
    "vol_5",
    "momentum_5"
]


def predict_xgboost(df: pd.DataFrame, horizon: str = "7d"):
    """
    XGBoost-based return prediction.
    Supports dynamic horizons like 7d, 14d, 30d.
    """

    if df is None or df.empty:
        raise ValueError("Empty dataframe passed to XGBoost")

    # -----------------------------
    # Build features
    # -----------------------------
    df_feat = build_features(df)

    if df_feat is None or df_feat.empty:
        raise ValueError("Feature builder returned empty dataframe")

    # -----------------------------
    # Resolve target column
    # -----------------------------
    target_col = f"target_{horizon}"

    if target_col not in df_feat.columns:
        raise ValueError(f"Missing target column: {target_col}")

    # -----------------------------
    # Minimum data requirement
    # -----------------------------
    if len(df_feat) < 50:
        raise ValueError("Not enough data for XGBoost")

    # Use last ~2 years max
    train = df_feat.iloc[-504:].copy()

    # -----------------------------
    # Ensure required features exist
    # -----------------------------
    for col in FEATURE_COLS:
        if col not in train.columns:
            raise ValueError(f"Missing feature column: {col}")

    # -----------------------------
    # Drop NaNs
    # -----------------------------
    train = train.dropna(subset=FEATURE_COLS + [target_col])

    if len(train) < 30:
        raise ValueError("Not enough clean rows after dropping NaNs")

    X = train[FEATURE_COLS].values
    y = train[target_col].values

    # -----------------------------
    # Train Model
    # -----------------------------
    model = XGBRegressor(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
        n_jobs=1,
        verbosity=0
    )

    model.fit(X, y)

    # -----------------------------
    # Latest prediction
    # -----------------------------
    latest_row = df_feat.iloc[-1]

    if latest_row[FEATURE_COLS].isnull().any():
        raise ValueError("Latest row contains NaN values")

    X_latest = latest_row[FEATURE_COLS].values.reshape(1, -1)

    pred_return = float(model.predict(X_latest)[0])

    last_close =  float(df["Close"].iloc[-1])
    expected_price = last_close * (1 + pred_return)

    # -----------------------------
    # Build smooth forecast path
    # -----------------------------
    h = int(horizon.replace("d", ""))

    path = [
        round(last_close * (1 + pred_return * (i / h)), 2)
        for i in range(1, h + 1)
    ]

    return {
        "horizon": horizon,
        "model": "xgboost",
        "last_close": round(last_close, 2),
        "expected_price": round(expected_price, 2),
        "expected_return_pct": round(pred_return * 100, 2),
        "path": path
    }
