"""
Handles PDF parsing and text extraction using pdfplumber.

This module provides utility functions to extract raw text from
PDF résumé files for further processing by downstream AI models.
"""

import pdfplumber


def extract_text(file):
    with pdfplumber.open(file.file) as pdf:
        return "\n".join(
            page.extract_text() for page in pdf.pages if page.extract_text()
        )
