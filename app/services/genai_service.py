"""
Provides Generative AI functionality for résumé analysis and enhancement.

This module is responsible for loading generative AI models and performing
résumé summarization, improvement recommendations, and gap analysis against
job descriptions.
"""

import logging
import os
from typing import List
import openai
from transformers import pipeline
import torch

# Set up logging
logger = logging.getLogger(__name__)

# --- Configure GenAI model based on environment ---
use_lightweight_models = os.getenv("LIGHTWEIGHT_MODELS", "false").lower() == "true"
openai_api_key = os.getenv("OPENAI_API_KEY")

# OpenAI API configuration - centralized for easy tuning
OPENAI_CONFIG = {
    "model": "gpt-3.5-turbo",  # Chat-optimized model, good balance of speed/quality
    "temperature": 0.7,  # Controls randomness: 0=deterministic, 1=very creative
    "max_tokens": 500,  # Output length limit to control costs and response time
}

if use_lightweight_models or not openai_api_key:
    # Use local model for lightweight/demo environments
    logger.info("Using lightweight local GenAI model for constrained environments")
    try:
        # FLAN-T5 is an instruction-tuned model better suited for our diverse tasks
        # (summarization, recommendations, analysis) compared to conversational models
        genai_model_name = "google/flan-t5-small"

        # HuggingFace pipeline abstraction - handles model loading, tokenization, and inference
        genai_pipeline = pipeline(
            "text2text-generation",  # FLAN-T5 uses text-to-text format, not text generation
            model=genai_model_name,
            tokenizer=genai_model_name,  # Converts text to/from model's internal representation
            device=0 if torch.cuda.is_available() else -1,  # GPU if available, else CPU
            max_length=OPENAI_CONFIG[
                "max_tokens"
            ],  # Match OpenAI config for consistency
            do_sample=True,  # Use sampling instead of greedy decoding for more varied outputs
            temperature=OPENAI_CONFIG[
                "temperature"
            ],  # Match OpenAI config for consistency
            truncation=True,  # Apply truncation at tokenizer level for safety
            return_full_text=False,  # Only return generated text, not input prompt
        )
        use_openai = False
        logger.debug(f"Loaded local GenAI model: {genai_model_name}")
    except Exception as e:
        logger.error(f"Failed to load local GenAI model: {str(e)}")
        # Graceful degradation: if model loading fails, we can still provide basic responses
        genai_pipeline = None
        use_openai = False
else:
    # CLOUD API PATH: When we have API access and want best quality
    logger.info("Using OpenAI API for full-powered GenAI functionality")
    openai.api_key = openai_api_key  # Authenticate with OpenAI service
    use_openai = True
    genai_pipeline = None  # Don't load local model if using API


# --- Helper functions for GenAI processing ---
def _call_openai_api(prompt: str) -> str:
    """
    Makes a call to OpenAI's API with error handling.
    """
    try:
        # ChatCompletion API expects messages in a specific format
        # Each message has a "role" (system, user, assistant) and "content"
        response = openai.ChatCompletion.create(
            model=OPENAI_CONFIG["model"],
            messages=[{"role": "user", "content": prompt}],  # Simple user prompt
            max_tokens=OPENAI_CONFIG["max_tokens"],
            temperature=OPENAI_CONFIG["temperature"],
        )
        # API returns multiple potential responses ("choices") - we take the first one
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"OpenAI API call failed: {str(e)}")
        # Convert all API errors to ValueError for consistent error handling
        raise ValueError(f"GenAI API call failed: {str(e)}")


def _call_local_model(
    prompt: str, max_length: int = OPENAI_CONFIG["max_tokens"]
) -> str:
    """
    Uses local model pipeline for text generation with fallback handling.
    """
    if genai_pipeline is None:
        # Fallback to simple rule-based response
        return "Analysis unavailable in lightweight mode. Please upgrade to full model."

    try:
        # Disable gradient computation - we're doing inference, not training
        # This reduces memory usage and speeds up computation
        with torch.no_grad():
            outputs = genai_pipeline(
                prompt,
                max_length=max_length,
                num_return_sequences=1,  # Generate one response (could generate multiple)
                do_sample=True,  # Use sampling for more varied responses
                # Note: truncation and return_full_text are set at pipeline level
            )

        # With return_full_text=False, we get only the generated content
        # No need for manual prompt trimming or string manipulation
        if isinstance(outputs, list) and len(outputs) > 0:
            # Handle both single output and list format
            result = outputs[0].get("generated_text", "").strip()
        else:
            result = str(outputs).strip() if outputs else ""

        if not result:
            logger.warning("Local model returned empty result")
            return "Unable to generate response with local model."

        return result

    except Exception as e:
        logger.error(f"Local model inference failed: {str(e)}")
        raise ValueError(f"Local GenAI model failed: {str(e)}")


def parse_bulleted_list(text: str, max_items: int = 8) -> List[str]:
    """
    Parses recommendation text into a structured list.
    Handles both numbered and bullet point formats.
    """
    import re

    lines = text.split("\n")
    items = []

    # Regex patterns for different list formats
    numbered_pattern = re.compile(
        r"^\d+\.\s*(.+)$"
    )  # Matches "1. ", "10. ", "123. ", etc.
    bullet_pattern = re.compile(r"^[-•*→‣▸]\s*(.+)$")  # Various bullet characters

    # Common GenAI filler phrases to skip (case-insensitive)
    header_patterns = [
        "recommendation",
        "suggestion",
        "here are",
        "as follows",
        "below are",
        "consider the following",
        "key points",
        "main points",
    ]

    for line in lines:
        line = line.strip()

        # Skip empty lines
        if not line:
            continue

        # Skip common GenAI header/filler text (case-insensitive)
        line_lower = line.lower()
        if any(header in line_lower for header in header_patterns):
            continue

        cleaned = None

        # Try to match numbered list format
        numbered_match = numbered_pattern.match(line)
        if numbered_match:
            cleaned = numbered_match.group(1).strip()
        else:
            # Try to match bullet point format
            bullet_match = bullet_pattern.match(line)
            if bullet_match:
                cleaned = bullet_match.group(1).strip()
            else:
                # If no specific format, use the line as-is (after basic filtering)
                # This handles cases where GenAI doesn't use standard formatting
                if not line_lower.endswith(":") and len(line) > 10:
                    cleaned = line

        # Quality filter: ignore very short or likely incomplete suggestions
        if cleaned and len(cleaned) > 10:
            items.append(cleaned)

    # Return limited results to prevent overwhelming users
    return items[:max_items]


# --- Main GenAI service functions ---
def summarize_resume(text: str) -> str:
    """
    Generates a concise summary of the résumé highlighting key qualifications,
    experience, and skills.
    """
    logger.debug(f"Generating résumé summary for text (length: {len(text)})")

    # Input validation - GenAI models need sufficient context to work with
    if not text or len(text.strip()) < 50:
        raise ValueError("Résumé text too short for meaningful summarization")

    # PROMPT ENGINEERING: Structure the request for optimal results
    prompt = f"""Please provide a concise professional summary of this résumé in 2-3 sentences, highlighting the candidate's key qualifications, experience level, and main skills:

{text[:3000]}  # Truncate to manage token limits and costs

Summary:"""  # This trailing prompt helps focus the model's response

    try:
        result = (
            _call_openai_api(prompt)
            if use_openai
            else _call_local_model(prompt, max_length=200)
        )

        logger.info(f"Generated résumé summary (length: {len(result)})")
        return result

    except Exception as e:
        logger.error(f"Error in summarize_resume: {str(e)}", exc_info=True)
        raise ValueError(f"Résumé summarization failed: {str(e)}")


def generate_recommendations(text: str) -> List[str]:
    """
    Analyzes the résumé and provides actionable recommendations for improvement.
    Returns a list of specific suggestions.
    """
    logger.debug(f"Generating recommendations for text (length: {len(text)})")

    if not text or len(text.strip()) < 50:
        raise ValueError("Résumé text too short for meaningful recommendations")

    # SIMPLIFIED PROMPT: Let the model use its natural formatting, parse robustly afterward
    prompt = f"""Analyze this résumé and provide 5-7 specific, actionable recommendations for improvement. Focus on content, structure, and presentation:

{text[:3000]}

Please provide specific recommendations in list format:"""

    try:
        result = (
            _call_openai_api(prompt)
            if use_openai
            else _call_local_model(prompt, max_length=400)
        )

        # POST-PROCESSING: Let robust parser handle whatever format the model returned
        recommendations = parse_bulleted_list(result, max_items=8)

        logger.info(f"Generated {len(recommendations)} recommendations")
        return recommendations

    except Exception as e:
        logger.error(f"Error in generate_recommendations: {str(e)}", exc_info=True)
        raise ValueError(f"Recommendation generation failed: {str(e)}")


def analyze_discrepancies(resume_text: str, job_text: str) -> str:
    """
    Compares the résumé against a job description and identifies key gaps
    and discrepancies between required qualifications and candidate profile.
    """
    logger.debug(
        f"Analyzing discrepancies between résumé ({len(resume_text)}) and job description ({len(job_text)})"
    )

    # Validate both inputs - comparative analysis needs both documents
    if not resume_text or not job_text:
        raise ValueError("Both résumé and job description text are required")

    if len(resume_text.strip()) < 50 or len(job_text.strip()) < 50:
        raise ValueError(
            "Résumé and/or job description texts too short for meaningful analysis"
        )

    # MULTI-DOCUMENT PROMPT ENGINEERING: Structure for comparative analysis
    prompt = f"""Compare this résumé against the job description and identify the key discrepancies, gaps, and missing qualifications. Be specific and constructive:

JOB DESCRIPTION:
{job_text[:5000]}

RÉSUMÉ:
{resume_text[:5000]}

ANALYSIS:
Key discrepancies and gaps:"""  # Prime the response format

    try:
        result = (
            _call_openai_api(prompt)
            if use_openai
            else _call_local_model(prompt, max_length=500)
        )

        logger.info(f"Generated discrepancy analysis (length: {len(result)})")
        return result

    except Exception as e:
        logger.error(f"Error in analyze_discrepancies: {str(e)}", exc_info=True)
        raise ValueError(f"Discrepancy analysis failed: {str(e)}")
