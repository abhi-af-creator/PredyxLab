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


def predict_ridge(df: pd.DataFrame, horizon: str = "7d", alpha: float = 1.0):

    if df is None or df.empty:
        raise ValueError("Empty dataframe passed to ridge")

    df_feat = build_features(df)

    target_col = f"target_{horizon}"

    if target_col not in df_feat.columns:
        raise ValueError(f"Missing target column: {target_col}")

    train = df_feat.iloc[-504:].copy()
    train = train.dropna(subset=FEATURE_COLS + [target_col])

    if len(train) < 30:
        raise ValueError("Not enough data for ridge")

    X = train[FEATURE_COLS].values
    y = train[target_col].values

    model = Ridge(alpha=alpha)
    model.fit(X, y)

    latest_row = df_feat.iloc[-1]

    if latest_row[FEATURE_COLS].isnull().any():
        raise ValueError("Latest row contains NaN values")

    X_latest = latest_row[FEATURE_COLS].values.reshape(1, -1)
    pred_return = float(model.predict(X_latest)[0])

    last_close = float(df["Close"].iloc[-1].item())
    expected_price = last_close * (1 + pred_return)

    h = int(horizon.replace("d", ""))

    path = [
        round(last_close * (1 + pred_return * (i / h)), 2)
        for i in range(1, h + 1)
    ]

    return {
        "horizon": horizon,
        "model": "ridge_regression",
        "last_close": round(last_close, 2),
        "expected_price": round(expected_price, 2),
        "expected_return_pct": round(pred_return * 100, 2),
        "path": path
    }
