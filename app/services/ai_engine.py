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
        entities = ner_pipeline(text)

    def sanitize(entity):
        """
        Converts all NumPy numeric types in the NER output to native Python types.
        This is necessary because FastAPI's JSON encoder cannot serialize np.float32 or np.int32 objects.
        Without this, returning the 'skills' list in an API response can raise a serialization error.
        """
        return {
            k: float(v) if isinstance(v, np.floating) else int(v) if isinstance(v, np.integer) else v
            for k, v in entity.items()
        }
    
    return [sanitize(e) for e in entities]


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
