"""
Handles PDF parsing and text extraction using pdfplumber.

This module provides utility functions to extract raw text from
PDF résumé files for further processing by downstream AI models.
"""

import logging
import pdfplumber

logger = logging.getLogger(__name__)


def extract_text(file):
    filename = getattr(file, "filename", "unknown_file")
    logger.debug(f"Starting PDF text extraction for file: {filename}")

    try:
        with pdfplumber.open(file.file) as pdf:
            logger.debug(f"PDF opened successfully. Pages: {len(pdf.pages)}")

            result = "\n".join(
                page.extract_text() for page in pdf.pages if page.extract_text()
            )

            logger.info(f"Successfully extracted {len(result)} characters from PDF")
            return result

    except Exception as e:
        logger.error(
            f"Error extracting text from PDF {filename}: {str(e)}", exc_info=True
        )
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
