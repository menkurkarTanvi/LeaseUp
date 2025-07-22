from fastapi import FastAPI

app = FastAPI(title="FastAPI Starter", version="1.0.0")

# Include routers


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI!"}