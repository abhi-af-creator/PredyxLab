def select_best_model(df):
    """
    Selects best model based on expected_return_pct.
    """

    from src.models.linear_predictor import predict_linear
    from src.models.baseline_predictor import predict_baseline
    from src.models.momentum_predictor import predict_momentum

    candidates = {}

    model_fns = {
        "linear": lambda d: predict_linear(d),
        "baseline": lambda d: predict_baseline(d, horizon="7d"),
        "momentum": lambda d: predict_momentum(d, horizon="7d")
    }

    for name, fn in model_fns.items():
        try:
            candidates[name] = fn(df)
        except Exception as e:
            print(f"{name} model failed:", repr(e))

    if not candidates:
        raise ValueError("No models produced valid predictions")

    best_key = max(
        candidates,
        key=lambda k: candidates[k]["expected_return_pct"]
    )

    return {
        "selected_model": candidates[best_key]["model"],
        "prediction": candidates[best_key],
        "candidates": candidates
    }
