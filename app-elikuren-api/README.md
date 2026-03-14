# app-elikuren-api

FastAPI-Backend für Kammerchor Elikuren.

## Voraussetzungen

- Python 3.12+ (oder 3.10+)

## Laufen lassen

Virtuelle Umgebung anlegen und starten:

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

API starten:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000  
- Docs (Swagger): http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/health
