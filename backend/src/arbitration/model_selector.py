import numpy as np


def compute_confidence(candidates: dict):
    """
    Confidence based on dispersion of predicted returns.
    Lower std deviation = higher confidence.
    """

    returns = np.array([
        v["expected_return_pct"]
        for v in candidates.values()
    ])

    if len(returns) <= 1:
        return 0.5

    std_dev = np.std(returns)

    # Normalize into 0–1 range
    confidence = 1 / (1 + std_dev)

    return round(float(confidence), 3)


def select_best_model(df, horizon: str = "7d"):

    from backend.src.models.linear_predictor import predict_linear
    from backend.src.models.baseline_predictor import predict_baseline
    from backend.src.models.momentum_predictor import predict_momentum
    from backend.src.models.ridge_predictor import predict_ridge
    from backend.src.models.xgboost_model import predict_xgboost
    from backend.src.models.ensemble_predictor import predict_ensemble
    from backend.src.models.random_forest_predictor import predict_random_forest

    candidates = {}

    model_fns = {
        "linear": lambda d: predict_linear(d, horizon=horizon),
        "baseline": lambda d: predict_baseline(d, horizon=horizon),
        "momentum": lambda d: predict_momentum(d, horizon=horizon),
        "ridge": lambda d: predict_ridge(d, horizon=horizon),
        "xgboost": lambda d: predict_xgboost(d, horizon=horizon),
        "random_forest": lambda d: predict_random_forest(d, horizon=horizon)
    }

    for name, fn in model_fns.items():
        try:
            candidates[name] = fn(df)
        except Exception as e:
            print(f"{name} model failed → {repr(e)}")

    if not candidates:
        raise ValueError("No models produced valid predictions")

    # -----------------------------
    # Ensemble
    # -----------------------------
    ensemble_prediction = predict_ensemble(candidates, horizon)

    # -----------------------------
    # Confidence
    # -----------------------------
    confidence_score = compute_confidence(candidates)

    # -----------------------------
    # Best Model Selection
    # -----------------------------
    best_key = max(
        candidates,
        key=lambda k: candidates[k]["expected_return_pct"]
    )

    return {
        "selected_model": candidates[best_key]["model"],
        "prediction": candidates[best_key],
        "ensemble": ensemble_prediction,
        "confidence": confidence_score,
        "candidates": candidates
    }
