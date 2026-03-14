from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok", "service": "elikuren-api"}

@app.get("/")
def root():
    return {"message": "FastAPI läuft"}

@app.get("/user")
def user():
    return {
        "message": {
            "user_id": "123456"
        }
    }