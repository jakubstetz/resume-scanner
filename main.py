"""
Entry point for the FastAPI application.

This file initializes the FastAPI app instance, defines the root endpoint,
and includes any routers or middleware for the application.
"""

from fastapi import FastAPI, UploadFile, File
from app.services.pdf_parser import extract_text
from app.services.ai_engine import extract_skills, compute_similarity

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Resume Scanner API"}


@app.post("/upload-resume")
async def upload_resume(resume: UploadFile = File(...)):
    resume_text = extract_text(resume)
    return {"resume_text": resume_text}


@app.post("/upload-job")
async def upload_job(
    job: UploadFile = File(None),
    job_text: str = Form(None),
):
    if job:
        job_text_extracted = extract_text(job)
        return {"job_text": job_text_extracted}
    elif job_text:
        return {"job_text": job_text}
    else:
        return {"error": "Either a job file or job text must be provided."}


@app.post("/analyze")
async def analyze_resume(
    resume_text: str = Form(...),
    job_text: str = Form(...),
):
    skills = extract_skills(resume_text)
    similarity = compute_similarity(resume_text, job_text)
    return {"skills": skills, "similarity": similarity}
