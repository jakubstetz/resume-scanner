"""
Provides core AI functionality for résumé analysis.

This module is responsible for loading pretrained models and performing
inference tasks such as skill extraction, named entity recognition, and
semantic similarity between résumé content and job descriptions.
"""

from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
from sentence_transformers import SentenceTransformer
import torch
import numpy as np

# --- Load models once at module level ---
ner_model_name = "Jean-Baptiste/roberta-large-ner-english"
similarity_model_name = "sentence-transformers/all-MiniLM-L6-v2"

ner_pipeline = pipeline(
    "ner", model=ner_model_name, tokenizer=ner_model_name, grouped_entities=True
)
similarity_model = SentenceTransformer(similarity_model_name)


# --- Skill extraction using NER ---
def extract_skills(text: str) -> list[dict]:
    """
    Extracts named entities from résumé text using a pretrained NER model.
    Returns a list of entities with labels and confidence scores.
    """
    with torch.no_grad():
        entities = ner_pipeline(text)
    return entities


# --- Semantic similarity scoring ---
def compute_similarity(resume_text: str, job_text: str) -> float:
    """
    Computes cosine similarity between résumé and job description embeddings.
    """
    embeddings = similarity_model.encode([resume_text, job_text])
    return float(
        np.dot(embeddings[0], embeddings[1])
        / (np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]))
    )
