"""
Entry point for the FastAPI application.

This file initializes the FastAPI app instance, defines the root endpoint,
and includes any routers or middleware for the application.
"""

from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Resume Scanner API"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    return {"filename": file.filename}
