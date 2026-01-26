import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from src.features.feature_builder import build_features

FEATURE_COLS = [
    "ret_1",
    "ret_5",
    "ma_5_ratio",
    "ma_10_ratio",
    "vol_5",
    "momentum_5",
]


def walk_forward_validate(
    df: pd.DataFrame,
    horizon_days: int = 7,
    train_window: int = 252,
    step: int = 1,
):
    """
    Walk-forward validation using Linear Regression (fixed model).

    Parameters
    ----------
    df : pd.DataFrame
        Raw OHLCV dataframe (yfinance output OK)
    horizon_days : int
        Prediction horizon (default 7 trading days)
    train_window : int
        Rolling training window size (default 252 = 1 year)
    step : int
        Step size between validations

    Returns
    -------
    dict
        Validation metrics
    """

    # ---------------- SAFETY CHECKS ----------------
    if df is None or df.empty:
        raise ValueError("Empty dataframe passed to walk-forward validator")

    # ---------------- FEATURE BUILD ----------------
    feat = build_features(df)

    if feat.empty or len(feat) < train_window + horizon_days:
        raise ValueError("Not enough data after feature engineering")

    results = []
    equity = 1.0

    # ---------------- WALK-FORWARD LOOP ----------------
    for i in range(train_window, len(feat) - horizon_days, step):
        train_slice = feat.iloc[i - train_window : i]
        test_row = feat.iloc[i]

        X_train = train_slice[FEATURE_COLS].values
        y_train = train_slice["target_7d"].values

        # Train model
        model = LinearRegression()
        model.fit(X_train, y_train)

        # Predict (scalar-safe)
        X_test = test_row[FEATURE_COLS].values.reshape(1, -1)
        predicted_return = float(model.predict(X_test)[0])
        actual_return = float(test_row["target_7d"])

        # Direction correctness (scalar-safe)
        direction_correct = int(
            np.sign(predicted_return) == np.sign(actual_return)
        )

        # Equity curve (simple compounding)
        equity *= (1 + actual_return)

        results.append({
            "predicted_return": predicted_return,
            "actual_return": actual_return,
            "direction_correct": direction_correct,
        })

    # ---------------- AGGREGATION ----------------
    res_df = pd.DataFrame(results)

    direction_accuracy = float(res_df["direction_correct"].mean() * 100)
    mean_abs_error = float(
        np.mean(np.abs(res_df["predicted_return"] - res_df["actual_return"])) * 100
    )

    return {
        "direction_accuracy_pct": round(direction_accuracy, 2),
        "mean_abs_error_pct": round(mean_abs_error, 2),
        "final_equity": round(float(equity), 3),
        "num_trades": int(len(res_df)),
    }
