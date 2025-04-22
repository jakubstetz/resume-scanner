"""
Entry point for the FastAPI application.

This file initializes the FastAPI app instance, defines the root endpoint,
and includes any routers or middleware for the application.
"""

# .env specifies allowed CORS origins and which AI models to use.
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from app.services.pdf_parser import extract_text
from app.services.ai_engine import extract_skills, compute_similarity
import os

app = FastAPI()

cors_origins = os.getenv("CORS_ORIGINS").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Replace "*" with specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Resume Scanner API"}


@app.post("/upload-resume")
async def upload_resume(resume: UploadFile = File(...)):
    resume_text = extract_text(resume)
    return {"filename": resume.filename, "content": resume_text}


@app.post("/upload-job")
async def upload_job(
    job: UploadFile = File(None),
    job_text: str = Form(None),
):
    if job:
        job_text_extracted = extract_text(job)
        return {"filename": job.filename, "content": job_text_extracted}
    elif job_text:
        return {"filename": False, "content": job_text}
    else:
        return {"error": "Either a job file or job text must be provided."}



@app.post("/analyze")
async def analyze_resume(
    resume_text: str = Body(...),
    job_text: str = Body(...),
):
    skills = extract_skills(resume_text)
    similarity = compute_similarity(resume_text, job_text)
    return {"skills": skills, "similarity": similarity}
