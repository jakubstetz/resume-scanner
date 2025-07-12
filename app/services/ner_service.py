"""
Provides Named Entity Recognition (NER) functionality for résumé analysis.

This module is responsible for loading pretrained NER models and performing
skill extraction from résumé content.
"""

import logging
from transformers import pipeline
import torch
import numpy as np
import os

# Set up logging
logger = logging.getLogger(__name__)

# --- Load NER model once at module level ---
# Use lightweight models if specified in environment
use_lightweight_models = os.getenv("LIGHTWEIGHT_MODELS", "false").lower() == "true"

if use_lightweight_models:  # Used primarily for rapid local testing
    logger.info("Using lightweight NER model for constrained environments")
    ner_model_name = "dslim/bert-base-NER"
else:  # Full-powered local development or production
    logger.info("Using full-powered NER model")
    ner_model_name = "Jean-Baptiste/roberta-large-ner-english"

logger.debug(f"Loading NER model: {ner_model_name}")
ner_pipeline = pipeline(
    "ner", model=ner_model_name, tokenizer=ner_model_name, grouped_entities=True
)


# --- Helper functions for NER processing ---
def filter_skill_entities(entities: list[dict]) -> list[dict]:
    """
    Filters out entities that are unlikely to represent skills.
    Only keeps entities with allowed labels.
    """
    allowed_labels = {"MISC"}
    return [e for e in entities if e.get("entity_group") in allowed_labels]


def sanitize_entity(entity: dict) -> dict:
    """
    Converts all NumPy numeric types in the NER output to native Python types.
    This is necessary because FastAPI's JSON encoder cannot serialize np.float32 or np.int32 objects.
    Without this, returning the 'skills' list in an API response can raise a serialization error.
    """
    return {
        k: (
            float(v)
            if isinstance(v, np.floating)
            else int(v) if isinstance(v, np.integer) else v
        )
        for k, v in entity.items()
    }


# --- Skill extraction using NER ---
def extract_skills(text: str) -> list[dict]:
    """
    Extracts named entities from text using a pretrained NER model.
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
