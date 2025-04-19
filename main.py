"""
Entry point for the FastAPI application.

This file initializes the FastAPI app instance, defines the root endpoint,
and includes any routers or middleware for the application.
"""

from fastapi import FastAPI, UploadFile, File
from app.services.pdf_parser import extract_text

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Resume Scanner API"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    text = extract_text(file)
    return {
        "filename": file.filename,
        "text": text[:1000],
    }  # return first 1000 chars as a preview
