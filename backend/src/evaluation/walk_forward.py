import numpy as np
import pandas as pd
from src.features.feature_builder import build_features
from src.models.linear_predictor import FEATURE_COLS
from linear_model import LinearRegression

def walk_forward_direction_accuracy(df: pd.DataFrame) -> float:
    """
    Computes direction accuracy for 7-day horizon
    using walk-forward validation.
    """

    df_feat = build_features(df)

    if len(df_feat) < 600:
        return 0.0

    correct = 0
    total = 0

    for i in range(504, len(df_feat) - 7):
        train = df_feat.iloc[i-504:i]
        test = df_feat.iloc[i]

        X_train = train[FEATURE_COLS].values
        y_train = train["target_7d"].values

        model = LinearRegression()
        model.fit(X_train, y_train)

        pred = model.predict(test[FEATURE_COLS].values.reshape(1, -1))[0]
        actual = test["target_7d"]

        if np.sign(pred) == np.sign(actual):
            correct += 1
        total += 1

    return round(correct / total, 3) if total > 0 else 0.0
