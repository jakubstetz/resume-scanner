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
import os
from app.utils import filter_skill_entities, sanitize_entity

# --- Load models once at module level ---
# This NER model is lightweight and specifically tuned for résumé-style data.
ner_model_name = os.getenv("NER_MODEL")

# This similarity model is widely used and well-tested.
similarity_model_name = os.getenv("SIMILARITY_MODEL")
similarity_model = SentenceTransformer(similarity_model_name)

ner_pipeline = pipeline(
    "ner", model=ner_model_name, tokenizer=ner_model_name, grouped_entities=True
)


# --- Skill extraction using NER ---
def extract_skills(text: str) -> list[dict]:
    """
    Extracts named entities from résumé text using a pretrained NER model.
    Returns a list of entities with labels and confidence scores.
    """
    # No gradients since we are doing inference, not training.
    with torch.no_grad():
        raw_entities = ner_pipeline(text)
    
    filtered_entities = filter_skill_entities(raw_entities)
    
    return [sanitize_entity(e) for e in filtered_entities]


# --- Semantic similarity scoring ---
def compute_similarity(resume_text: str, job_text: str) -> float:
    """
    Computes cosine similarity between résumé and job description embeddings.
    Each text is embedded into a 768-dimensional vector.
    """
    embeddings = similarity_model.encode([resume_text, job_text])
    return float(
        np.dot(embeddings[0], embeddings[1])
        / (np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]))
    )
