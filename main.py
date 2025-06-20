"""
Entry point for the FastAPI application.

This file initializes the FastAPI app instance, defines the root endpoint,
and includes any routers or middleware for the application.
"""

# .env specifies allowed CORS origins and which AI models to use.
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, UploadFile, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime

from app.services.pdf_parser import extract_text
from app.services.ai_engine import extract_skills, compute_similarity
from app.logging_config import setup_logging

# Setup logging
logger = setup_logging()

app = FastAPI()

cors_origins = os.getenv("CORS_ORIGINS").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    logger.info("Root endpoint accessed")
    return {"message": "Resume Scanner API"}


@app.post("/upload-document")
async def upload_document(document: UploadFile = File(...)):
    logger.info(f"Document upload started: {document.filename}")
    try:
        start_time = datetime.now()
        text = extract_text(document)
        process_time = (datetime.now() - start_time).total_seconds()

        logger.info(
            f"Document processed successfully: {document.filename}, "
            f"size: {len(text)} chars, processing time: {process_time:.2f}s"
        )
        return {"filename": document.filename, "content": text}

    except ValueError as e:
        logger.error(f"Document validation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(
            f"Unexpected error processing document {document.filename}: {str(e)}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500, detail="Failed to process document. Please try again."
        )


@app.post("/analyze")
async def analyze_resume(
    request: Request,
    resume_text: str = Body(...),
    job_text: str = Body(...),
):
    client_ip = request.client.host if request.client else "unknown"
    logger.info(
        f"Analysis request from {client_ip}. "
        f"Resume length: {len(resume_text)}, Job description length: {len(job_text)}"
    )

    if not resume_text or not job_text:
        logger.warning("Missing resume or job text in analysis request")
        raise HTTPException(status_code=422, detail="Resume or job text is missing.")

    try:
        start_time = datetime.now()
        skills = extract_skills(resume_text)
        process_time = (datetime.now() - start_time).total_seconds()
        logger.info(
            f"Analysis completed in {process_time:.2f}s. Skills found: {len(skills)}"
        )

        if not skills:
            logger.warning("No skills extracted from the resume")
        similarity = compute_similarity(resume_text, job_text)
        return {"skills": skills, "similarity": similarity}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
