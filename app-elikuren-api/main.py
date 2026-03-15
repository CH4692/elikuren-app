from fastapi import FastAPI

app = FastAPI()
# New
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

@app.get("/testing")
def user():
    return {
        "message": {
            "test_user": "charles"
        }
    }