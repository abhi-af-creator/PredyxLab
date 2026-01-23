from fastapi import FastAPI

app = FastAPI(
    title="PredyxLab API",
    description="Modular stock prediction and analytics platform",
    version="0.1.0"
)

@app.get("/")
def health():
    return {"status": "PredyxLab backend running"}
