📈 PredyxLab — Stock Analysis & Prediction Platform

PredyxLab is an end-to-end stock analytics and prediction platform built with a strong focus on correctness, validation, and extensibility.
It combines historical market data, feature engineering, machine-learning models, and walk-forward validation, all wrapped in an interactive multi-chart UI.

This project was built with a production mindset: every model is validated, every assumption is tested, and UI decisions are made to support real analytical workflows.

🚀 Background & Motivation

Most stock prediction projects:

Jump straight to ML models

Skip validation

Show predictions without measuring if they actually work

PredyxLab takes the opposite approach.

The goal is not just to predict, but to:

Measure predictability

Validate models over time

Understand when models fail

Build a system that can evolve safely without breaking existing functionality

🏗️ Architecture Overview
Backend (FastAPI + Python)

Data source: Yahoo Finance (yfinance)

Feature engineering: Custom, leakage-safe features

Models: Baseline + Linear Regression (extensible)

Validation: Walk-forward validation (time-series correct)

API: REST endpoints for historical data & predictions

Frontend (React)

Multi-chart analytical dashboard

Per-chart controls (symbol, date range, price type)

Dynamic chart addition/removal

Prediction modal with future price paths

Clean, modern UI with smooth transitions

✨ Key Achievements (So Far)
✅ Robust Data Handling

Handles yfinance MultiIndex outputs safely

Guarantees scalar values where required

Defensive coding against empty / malformed data

✅ Feature Engineering (Leakage-Safe)

Features include:

Returns (1-day, 5-day)

Moving average ratios

Volatility measures

Momentum

Forward return targets (for supervised learning)

All features are built without future leakage.

✅ Prediction Models
1️⃣ Baseline Predictor

Mean return–based projection

Acts as a benchmark (always required in serious ML work)

2️⃣ Linear Regression Predictor (7-day horizon)

Uses engineered features

Trained on rolling historical windows

Produces:

Expected return

Expected price

Smooth projected price path

✅ Walk-Forward Validation (Critical)

Implemented true walk-forward validation, not random splits.

Metrics produced:

Directional accuracy

Mean absolute error

Equity curve simulation

Number of trades

Example output:

{
  "direction_accuracy_pct": 48.86,
  "mean_abs_error_pct": 2.93,
  "final_equity": 8.265,
  "num_trades": 964
}


This ensures:

No lookahead bias

No overfitting illusions

Honest performance evaluation

✅ Frontend UX Highlights

Up to 6 simultaneous charts

Independent controls per chart

Open / Close / Open+Close toggles

Predict button enabled only when data exists

Modal-based prediction display

Smooth grid reflow and transitions

Designed for analysis, not demos

🧪 Validation Philosophy

PredyxLab follows these principles:

If a model isn’t validated, it doesn’t exist

Baseline first, ML second

Time series ≠ random split

UI should never hide uncertainty

This makes the platform suitable for:

Research

Strategy prototyping

Education

Further ML experimentation

🛣️ Roadmap (What’s Next)
🔜 Short-Term

Add selectable prediction horizons (7d / 30d / 1y)

Display walk-forward metrics in UI

Compare multiple models side-by-side

Confidence bands on predictions

🔜 Medium-Term

Additional models:

Ridge / Lasso

Tree-based models

Gradient boosting

Feature importance visualization

Model performance dashboards

🔜 Long-Term

News sentiment integration

Regime detection (trend vs range)

Strategy backtesting layer

CI/CD for model deployment

Multi-exchange support (BSE, others)

🧠 What Makes This Project Different

No shortcuts

No hidden leakage

No “magic” predictions

Validation comes before visual polish

Designed to scale safely as models evolve

This is not a toy project — it’s a foundation.

⚠️ Disclaimer

This project is for educational and research purposes only.
It is not financial advice and should not be used for live trading without further rigorous testing and risk management.

👤 Author

Built with care, patience, and engineering discipline by Abhilash.