from fastapi import FastAPI
from LeaseUp.backend.routes import questions
from backend.routes import maps
app = FastAPI(title="FastAPI Starter", version="1.0.0")

# Include routers
app.include_router(questions.router)
app.include_router(maps.router)

@app.get("/")
def root():
    return {"message": "Welcome to FastAPI!"}