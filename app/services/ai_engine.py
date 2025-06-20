"""
Provides core AI functionality for résumé analysis.

This module is responsible for loading pretrained models and performing
inference tasks such as skill extraction, named entity recognition, and
semantic similarity between résumé content and job descriptions.
"""

import logging
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import torch
import numpy as np
import os
from app.utils import filter_skill_entities, sanitize_entity

# Set up logging
logger = logging.getLogger(__name__)

# --- Load models once at module level ---
# Use lightweight models if specified in environment
use_lightweight_models = os.getenv("LIGHTWEIGHT_MODELS", "false").lower() == "true"

if use_lightweight_models:  # Used primarily for demo hosting with constrained resources
    logger.info("Using lightweight models for constrained environments")
    ner_model_name = "dslim/bert-base-NER"
    similarity_model_name = "sentence-transformers/all-MiniLM-L6-v2"
else:  # Full-powered local development or production
    logger.info("Using full-powered models")
    ner_model_name = "Jean-Baptiste/roberta-large-ner-english"
    similarity_model_name = "sentence-transformers/all-MiniLM-L6-v2"

logger.debug(f"Loading similarity model: {similarity_model_name}")
similarity_model = SentenceTransformer(similarity_model_name)

logger.debug(f"Loading NER model: {ner_model_name}")
ner_pipeline = pipeline(
    "ner", model=ner_model_name, tokenizer=ner_model_name, grouped_entities=True
)


# --- Skill extraction using NER ---
def extract_skills(text: str) -> list[dict]:
    """
    Extracts named entities from résumé text using a pretrained NER model.
    Returns a list of entities with labels and confidence scores.
    """
    logger.debug(f"Extracting skills from text (length: {len(text)})")

    try:
        # No gradients since we are doing inference, not training.
        with torch.no_grad():
            logger.debug("Running NER pipeline...")
            raw_entities = ner_pipeline(text)

        logger.debug(f"Found {len(raw_entities)} raw entities")
        filtered_entities = filter_skill_entities(raw_entities)
        logger.debug(f"After filtering: {len(filtered_entities)} entities")

        result = [sanitize_entity(e) for e in filtered_entities]
        logger.info(f"Extracted {len(result)} skills from text")
        return result

    except Exception as e:
        logger.error(f"Error in extract_skills: {str(e)}", exc_info=True)
        raise ValueError(f"NER model inference failed: {str(e)}")


# --- Semantic similarity scoring ---
def compute_similarity(resume_text: str, job_text: str) -> float:
    """
    Computes cosine similarity between résumé and job description embeddings.
    Each text is embedded into a 768-dimensional vector.
    """
    logger.debug("Computing similarity between resume and job description")

    try:
        # Encode the texts to get their embeddings
        embeddings = similarity_model.encode([resume_text, job_text])
        logger.debug(f"Generated embeddings of shape: {[e.shape for e in embeddings]}")

        if not all(len(vec) > 0 for vec in embeddings):
            logger.error("Embedding failed: one or both texts returned empty vectors")
            raise ValueError(
                "Embedding failed: one or both texts returned empty vectors."
            )

        dot_product = np.dot(embeddings[0], embeddings[1])
        norm_product = np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])

        if norm_product == 0:
            logger.error("Cannot compute similarity with zero-vector embeddings")
            raise ValueError(
                "Invalid input: cannot compute similarity with zero-vector embeddings."
            )

        similarity = float(dot_product / norm_product)
        logger.info(f"Computed similarity score: {similarity:.3f}")
        return similarity

    except Exception as e:
        logger.error(f"Error in compute_similarity: {str(e)}", exc_info=True)
        raise ValueError(f"Similarity computation failed: {str(e)}")
