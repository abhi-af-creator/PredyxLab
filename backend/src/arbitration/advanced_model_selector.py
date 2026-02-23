import numpy as np
import pandas as pd

from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from xgboost import XGBRegressor

from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
from tensorflow.keras.optimizers import Adam


def rmse(true, pred):
    return np.sqrt(mean_squared_error(true, pred))


def create_lags(series, lags=5):
    df_lag = pd.DataFrame(series)
    df_lag.columns = ["Close"]
    for i in range(1, lags + 1):
        df_lag[f"lag_{i}"] = df_lag["Close"].shift(i)
    return df_lag.dropna()


def select_best_advanced_model(df: pd.DataFrame, horizon: int = 7):

    series = df["Close"]
    tscv = TimeSeriesSplit(n_splits=3)
    scores = {}

    # ---------------- ARIMA ----------------
    arima_scores = []
    for train_idx, test_idx in tscv.split(series):
        train, test = series.iloc[train_idx], series.iloc[test_idx]
        model = ARIMA(train, order=(1,1,1)).fit()
        pred = model.forecast(len(test))
        arima_scores.append(rmse(test, pred))
    scores["ARIMA"] = np.mean(arima_scores)

    # ---------------- SARIMA ----------------
    sarima_scores = []
    for train_idx, test_idx in tscv.split(series):
        train, test = series.iloc[train_idx], series.iloc[test_idx]
        model = SARIMAX(train, order=(1,1,1), seasonal_order=(0,0,0,0)).fit(disp=False)
        pred = model.forecast(len(test))
        sarima_scores.append(rmse(test, pred))
    scores["SARIMA"] = np.mean(sarima_scores)

    # ---------------- Random Forest ----------------
    lagged = create_lags(series)
    rf_scores = []

    for train_idx, test_idx in tscv.split(lagged):
        train, test = lagged.iloc[train_idx], lagged.iloc[test_idx]
        X_train = train.drop("Close", axis=1)
        y_train = train["Close"]
        X_test = test.drop("Close", axis=1)
        y_test = test["Close"]

        model = RandomForestRegressor()
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        rf_scores.append(rmse(y_test, pred))

    scores["RandomForest"] = np.mean(rf_scores)

    # ---------------- XGBoost ----------------
    xgb_scores = []
    for train_idx, test_idx in tscv.split(lagged):
        train, test = lagged.iloc[train_idx], lagged.iloc[test_idx]
        X_train = train.drop("Close", axis=1)
        y_train = train["Close"]
        X_test = test.drop("Close", axis=1)
        y_test = test["Close"]

        model = XGBRegressor(objective='reg:squarederror')
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        xgb_scores.append(rmse(y_test, pred))

    scores["XGBoost"] = np.mean(xgb_scores)

    # ---------------- Prophet ----------------
    prophet_scores = []
    prophet_df = df.reset_index()[["Date", "Close"]]
    prophet_df.columns = ["ds", "y"]

    for train_idx, test_idx in tscv.split(prophet_df):
        train, test = prophet_df.iloc[train_idx], prophet_df.iloc[test_idx]
        model = Prophet()
        model.fit(train)
        future = model.make_future_dataframe(periods=len(test), include_history=False)
        forecast = model.predict(future)
        prophet_scores.append(rmse(test["y"], forecast["yhat"]))

    scores["Prophet"] = np.mean(prophet_scores)

    # ---------------- Select Best ----------------
    best_model = min(scores, key=scores.get)
    best_rmse = scores[best_model]
    worst_rmse = max(scores.values())
    #
    if worst_rmse == 0:
        confidence = 100.0
    else:
        confidence = round((1 - (best_rmse / worst_rmse)) * 100, 2)


    # ---------------- Final Forecast ----------------
    forecast_values = []

    if best_model == "ARIMA":
        model = ARIMA(series, order=(1,1,1)).fit()
        forecast_values = model.forecast(steps=horizon)

    elif best_model == "SARIMA":
        model = SARIMAX(series, order=(1,1,1), seasonal_order=(0,0,0,0)).fit()
        forecast_values = model.forecast(steps=horizon)

    elif best_model == "RandomForest":
        lagged_full = create_lags(series)
        X = lagged_full.drop("Close", axis=1)
        y = lagged_full["Close"]
        model = RandomForestRegressor()
        model.fit(X, y)

        last_row = X.iloc[-1].values.reshape(1, -1)
        for _ in range(horizon):
            pred = model.predict(last_row)[0]
            forecast_values.append(pred)
            last_row = np.roll(last_row, -1)
            last_row[0, -1] = pred

    elif best_model == "XGBoost":
        lagged_full = create_lags(series)
        X = lagged_full.drop("Close", axis=1)
        y = lagged_full["Close"]
        model = XGBRegressor(objective='reg:squarederror')
        model.fit(X, y)

        last_row = X.iloc[-1].values.reshape(1, -1)
        for _ in range(horizon):
            pred = model.predict(last_row)[0]
            forecast_values.append(pred)
            last_row = np.roll(last_row, -1)
            last_row[0, -1] = pred

    elif best_model == "Prophet":
        model = Prophet()
        model.fit(prophet_df)
        future = model.make_future_dataframe(periods=horizon)
        forecast_df = model.predict(future)
        forecast_values = forecast_df["yhat"].tail(horizon).values

    forecast_values = np.array(forecast_values).flatten()
    forecast_values = np.round(forecast_values, 2)

    return {
        "selected_model": best_model,
       # "scores": scores,
        "prediction": forecast_values.tolist(),
        "confidence": confidence
    }
