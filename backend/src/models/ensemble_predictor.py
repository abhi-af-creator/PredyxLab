def predict_ensemble(candidates: dict, horizon: str = "7d"):
    """
    Weighted ensemble of model predictions.
    Expects dictionary of model outputs.
    """

    if not candidates:
        raise ValueError("No candidate models available for ensemble")

    # -----------------------------
    # Collect predicted returns
    # -----------------------------
    returns = [
        v["expected_return_pct"]
        for v in candidates.values()
    ]

    # Equal weights for now
    avg_return_pct = sum(returns) / len(returns)

    # Use consistent last_close from any model
    sample_model = next(iter(candidates.values()))
    last_close = sample_model["last_close"]

    expected_price = last_close * (1 + avg_return_pct / 100)

    h = int(horizon.replace("d", ""))

    path = [
        round(last_close * (1 + (avg_return_pct / 100) * (i / h)), 2)
        for i in range(1, h + 1)
    ]

    return {
        "horizon": horizon,
        "model": "ensemble_average",
        "last_close": round(last_close, 2),
        "expected_price": round(expected_price, 2),
        "expected_return_pct": round(avg_return_pct, 2),
        "path": path
    }
