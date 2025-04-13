import pdfplumber


def extract_text(file):
    with pdfplumber.open(file.file) as pdf:
        return "\n".join(
            page.extract_text() for page in pdf.pages if page.extract_text()
        )
