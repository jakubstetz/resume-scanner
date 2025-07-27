"""
Provides semantic similarity scoring functionality for résumé-JD comparison.

This module is responsible for loading pretrained sentence transformer models
and computing similarity between résumé content and job descriptions.
"""

import logging
from sentence_transformers import SentenceTransformer
import numpy as np
import os

# Set up logging
logger = logging.getLogger(__name__)

# --- Load similarity model once at module level ---
# Use lightweight models if specified in environment
use_lightweight_models = os.getenv("LIGHTWEIGHT_MODELS", "false").lower() == "true"

if use_lightweight_models:  # Used primarily for demo hosting with constrained resources
    logger.info("Using lightweight similarity model for constrained environments")
    similarity_model_name = "sentence-transformers/all-MiniLM-L6-v2"
else:  # Full-powered local development or production
    logger.info("Using full-powered similarity model")
    similarity_model_name = "sentence-transformers/all-MiniLM-L6-v2"

logger.debug(f"Loading similarity model: {similarity_model_name}")
similarity_model = SentenceTransformer(similarity_model_name)


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
